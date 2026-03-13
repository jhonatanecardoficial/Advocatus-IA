import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { PrismaService } from '../prisma/prisma.service'
import { GetUploadUrlDto, ConfirmUploadDto } from './dto/document.dto'

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
                version: 1,
            },
        })
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
}
