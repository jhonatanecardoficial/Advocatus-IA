"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function uploadDocumentAction(formData: FormData) {
    try {
        console.log('[Action] uploadDocumentAction iniciada.');
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const file = formData.get('file') as File;
        const matterId = formData.get('matterId') as string;
        const parentVersionId = formData.get('parentVersionId') as string | null;

        if (!file || !matterId) return { error: "Ficheiro e processo são obrigatórios." };
        console.log(`[Action] Metadados: file=${file.name}, size=${file.size}, matterId=${matterId}`);

        // Step 1: Get signed upload URL from the API
        console.log('[Action] Step 1: Obtendo URL assinada do Backend...');
        const urlResponse = await fetch(`${API_URL}/documents/upload-url`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                matterId,
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
                sizeBytes: file.size,
            }),
            cache: "no-store",
        });

        if (urlResponse.status === 401) {
            console.error('[Action] Erro 401: Token inválido ou expirado.');
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!urlResponse.ok) {
            const errorText = await urlResponse.text();
            console.error('[Action] Erro no Step 1:', errorText);
            const errorData = JSON.parse(errorText || '{}');
            return { error: errorData?.message || "Erro ao obter URL de upload." };
        }

        const { signedUrl, storagePath } = await urlResponse.json();
        console.log('[Action] Step 1 Sucesso. StoragePath:', storagePath);

        // Step 2: Upload the file directly to Supabase Storage using the signed URL
        console.log('[Action] Step 2: Upload direto para o Supabase Storage...');
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        
        const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type || "application/octet-stream",
            },
            body: fileBuffer,
        });

        if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.text();
            console.error('[Action] Erro no Step 2 (Supabase):', uploadError);
            return { error: "Erro ao fazer upload do ficheiro para o armazenamento." };
        }
        console.log('[Action] Step 2 Sucesso.');

        // Step 3: Confirm the upload in the API (saves metadata to DB)
        console.log('[Action] Step 3: Confirmando upload no Backend...');
        const confirmResponse = await fetch(`${API_URL}/documents/confirm-upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                matterId,
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
                sizeBytes: file.size,
                storagePath,
                parentVersionId: parentVersionId || undefined,
            }),
            cache: "no-store",
        });

        if (confirmResponse.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!confirmResponse.ok) {
            const confirmError = await confirmResponse.text();
            console.error('[Action] Erro no Step 3:', confirmError);
            const errorData = JSON.parse(confirmError || '{}');
            return { error: errorData?.message || "Erro ao confirmar upload do documento." };
        }

        const result = await confirmResponse.json();
        console.log('[Action] Step 3 Sucesso. Registro criado:', result.document?.id || result.id);

        revalidatePath(`/matters/${matterId}`);
        revalidatePath('/matters/[id]', 'page');
        
        return result;
    } catch (error: any) {
        console.error('[Action] EXCEPTION:', error);
        return { error: `Erro técnico: ${error.message || "Não foi possível contactar o servidor Backend."}` };
    }
}

export async function deleteDocumentAction(documentId: string, matterId: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/documents/${documentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao apagar o documento." };
        }

        revalidatePath(`/matters/${matterId}`);
        revalidatePath('/matters/[id]', 'page');

        return { success: true };
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}
