import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { PrismaService } from '../prisma/prisma.service'
import { GetUploadUrlDto, ConfirmUploadDto, RequestSignatureDto } from './dto/document.dto'

@Injectable()
export class DocumentsService {
    private supabase: SupabaseClient
    private storageBucket: string

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        const supabaseUrl = this.config.get<string>('SUPABASE_URL')
        const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')
        this.storageBucket = this.config.get<string>('STORAGE_BUCKET', 'advocatus-documents')

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration is missing in environment variables.')
        }

        this.supabase = createClient(supabaseUrl, supabaseKey)
    }

    async getUploadUrl(tenantId: string, _userId: string, dto: GetUploadUrlDto) {
        // Garantir que matter existe e é do tenant
        const matter = await this.prisma.matter.findFirst({
            where: { id: dto.matterId, tenantId },
        })

        if (!matter) {
            throw new NotFoundException('Processo não encontrado.')
        }

        // Caminho seguro no storage: tenantId/matterId/timestamp_filename
        const timestamp = Date.now()
        // Substituir espaços e carateres especiais no nome
        const safeFilename = dto.filename.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${tenantId}/${dto.matterId}/${timestamp}_${safeFilename}`

        const { data, error } = await this.supabase.storage
            .from(this.storageBucket)
            .createSignedUploadUrl(storagePath)

        if (error || !data) {
            throw new InternalServerErrorException(`Falha ao gerar URL de upload: ${error?.message}`)
        }

        return {
            signedUrl: data.signedUrl,
            storagePath,
            token: data.token,
        }
    }

    async confirmUpload(tenantId: string, userId: string, dto: ConfirmUploadDto) {
        const matter = await this.prisma.matter.findFirst({
            where: { id: dto.matterId, tenantId },
        })

        if (!matter) throw new NotFoundException('Processo não encontrado.')

        let version = 1;
        const parentId = dto.parentVersionId;

        if (parentId) {
            const parentDoc = await this.prisma.document.findFirst({
                where: { id: parentId, tenantId },
                select: { version: true, parentVersionId: true }
            });

            if (!parentDoc) throw new NotFoundException('Documento pai não encontrado.');

            // Se o documento fornecido já for uma versão subordinada, 
            // devemos subir até à raiz ou usar o pai directo conforme a lógica de árvore
            // Aqui vamos simplificar: o utilizador envia sempre o ID do documento que quer substituir.
            
            // Procurar a versão mais alta para este "tronco" de documentos
            const latestVersion = await this.prisma.document.findFirst({
                where: { 
                    tenantId,
                    OR: [
                        { id: parentId },
                        { parentVersionId: parentId }
                    ]
                },
                orderBy: { version: 'desc' },
                select: { version: true }
            });

            version = (latestVersion?.version || 1) + 1;
        }

        // Grava metadados do documento no PostgreSQL
        return this.prisma.document.create({
            data: {
                tenantId,
                matterId: dto.matterId,
                uploadedById: userId,
                filename: dto.filename,
                mimeType: dto.mimeType,
                sizeBytes: dto.sizeBytes,
                storagePath: dto.storagePath,
                version: version,
                parentVersionId: parentId,
                signatureType: dto.signatureType || 'NONE',
                signatureStatus: dto.signatureStatus || (dto.signatureType && dto.signatureType !== 'NONE' ? 'PENDING' : null),
            },
        })
    }

    async uploadAiDraft(tenantId: string, matterId: string, filename: string, content: string) {
        const timestamp = Date.now()
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${tenantId}/${matterId}/ai_${timestamp}_${safeFilename}.html`

        const { error } = await this.supabase.storage
            .from(this.storageBucket)
            .upload(storagePath, content, { 
                contentType: 'text/html',
                upsert: true 
            })

        if (error) {
            throw new InternalServerErrorException(`Falha ao carregar rascunho IA: ${error.message}`)
        }

        return { storagePath, size: content.length }
    }

    async requestSignature(tenantId: string, _userId: string, dto: RequestSignatureDto) {
        const doc = await this.prisma.document.findFirst({
            where: { id: dto.documentId, tenantId },
        })

        if (!doc) throw new NotFoundException('Documento não encontrado.')

        return this.prisma.document.update({
            where: { id: dto.documentId },
            data: {
                signatureType: dto.signatureType,
                signatureStatus: 'PENDING',
                signatureProvider: dto.signatureType === 'QES' ? 'AUTENTICACAO_GOV' : 'MULTICERT',
                signatureMetadata: {
                    requestedAt: new Date(),
                    signatories: dto.signatories || [],
                },
            },
        })
    }

    async getVersionHistory(tenantId: string, documentId: string) {
        // Encontrar o documento raiz (se o ID passado for uma versão, encontrar o pai original)
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, tenantId }
        });

        if (!doc) throw new NotFoundException('Documento não encontrado.');

        const rootId = doc.parentVersionId || doc.id;

        return this.prisma.document.findMany({
            where: {
                tenantId,
                OR: [
                    { id: rootId },
                    { parentVersionId: rootId }
                ]
            },
            orderBy: { version: 'desc' },
            include: {
                // Incluir quem fez o upload se necessário (precisaria de relação no prisma)
            }
        });
    }

    async getDownloadUrl(tenantId: string, id: string) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        })

        if (!document) {
            throw new NotFoundException('Documento não encontrado.')
        }

        // Gera URL pre-signed para download (válido por 1 hora)
        const { data, error } = await this.supabase.storage
            .from(this.storageBucket)
            .createSignedUrl(document.storagePath, 3600, { download: document.filename })

        if (error || !data) {
            throw new InternalServerErrorException(`Falha ao gerar URL de download: ${error?.message}`)
        }

        return {
            signedUrl: data.signedUrl,
            filename: document.filename,
        }
    }

    async toggleShare(tenantId: string, id: string, isSharedWithClient: boolean) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        })

        if (!document) {
            throw new NotFoundException('Documento não encontrado.')
        }

        return this.prisma.document.update({
            where: { id },
            data: { isSharedWithClient },
        })
    }

    async remove(tenantId: string, id: string) {
        // 1. Procurar o documento e as suas versões
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        })

        if (!document) {
            throw new NotFoundException('Documento não encontrado.')
        }

        // Se for um documento pai, apaga ele e todos os filhos.
        // Se for um documento filho, o user pediu "limpeza completa", então apagamos a linhagem toda.
        const rootId = document.parentVersionId || document.id;

        const allVersions = await this.prisma.document.findMany({
            where: {
                tenantId,
                OR: [
                    { id: rootId },
                    { parentVersionId: rootId }
                ]
            },
            select: { storagePath: true, id: true, signedDocuments: { select: { signedFilePath: true } } }
        });

        const storagePaths: string[] = [];
        const ids: string[] = [];

        for (const v of allVersions) {
            ids.push(v.id);
            if (v.storagePath) storagePaths.push(v.storagePath);
            
            // Se houver documentos assinados associados, também apagamos os ficheiros deles
            for (const sd of v.signedDocuments) {
                if (sd.signedFilePath) storagePaths.push(sd.signedFilePath);
            }
        }

        // 2. Apagar do Supabase Storage
        if (storagePaths.length > 0) {
            const { error: storageError } = await this.supabase.storage
                .from(this.storageBucket)
                .remove(storagePaths);

            if (storageError) {
                console.error(`Erro ao apagar ficheiros do storage: ${storageError.message}`);
                // Não lançamos excepção aqui para garantir a limpeza da DB, 
                // ficheiros órfãos são menos graves que inconsistência de dados.
            }
        }

        // 3. Apagar da Base de Dados (Prisma)
        // Limpar SignedDocument primeiro para evitar FK violations
        await this.prisma.signedDocument.deleteMany({
            where: {
                documentId: { in: ids },
                tenantId
            }
        });

        await this.prisma.document.deleteMany({
            where: {
                id: { in: ids },
                tenantId
            }
        });

        return { success: true, removedCount: ids.length };
    }
}
