"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function seedTestClients() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const testClients = [
            { nome: 'Ana Martins', email: 'ana.martins@exemplo.com', telefone: '912345678', nif: '102345678', tipo: 'SINGULAR' },
            { nome: 'Bruno Costa', email: 'bruno.costa@exemplo.com', telefone: '923456789', nif: '202345678', tipo: 'SINGULAR' },
            { nome: 'Carla Oliveira', email: 'carla.oliveira@exemplo.com', telefone: '934567890', nif: '302345678', tipo: 'SINGULAR' },
            { nome: 'Daniel Santos', email: 'daniel.santos@exemplo.com', telefone: '965432109', nif: '402345678', tipo: 'SINGULAR' },
            { nome: 'Elisa Ferreira', email: 'elisa.ferreira@exemplo.com', telefone: '967890123', nif: '502345678', tipo: 'SINGULAR' },
            { nome: 'Fábio Rodrigues', email: 'fabio.rodrigues@exemplo.com', telefone: '912344321', nif: '602345678', tipo: 'SINGULAR' },
            { nome: 'Gonçalo Almeida', email: 'goncalo.almeida@exemplo.com', telefone: '923455432', nif: '702345678', tipo: 'SINGULAR' }
        ];

        for (const client of testClients) {
            const response = await fetch(`${API_URL}/clients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(client)
            });

            if (!response.ok) {
                console.error(`Erro ao inserir ${client.nome}:`, response.statusText);
            }
        }

        return { success: true, message: '7 clientes de teste inseridos via API!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
