import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
    private client: Client;
    private transport: StdioClientTransport;
    private readonly logger = new Logger(McpClientService.name);

    constructor(private configService: ConfigService) {}

    async onModuleInit() {
        try {
            this.logger.log('Inicializando cliente MCP Jurídico...');
            
            // Caminho para o servidor MCP compilado
            const serverPath = path.resolve(process.cwd(), '../../packages/mcp-legal-server/dist/index.js');
            
            this.transport = new StdioClientTransport({
                command: "node",
                args: [serverPath],
                env: {
                    ...process.env,
                    EFATURA_API_CLIENT_ID: this.configService.get('EFATURA_API_CLIENT_ID') || '',
                    EFATURA_API_CLIENT_SECRET: this.configService.get('EFATURA_API_CLIENT_SECRET') || '',
                    EFATURA_API_NIF: this.configService.get('EFATURA_API_NIF') || '',
                    EFATURA_API_PASSWORD: this.configService.get('EFATURA_API_PASSWORD') || '',
                    EFATURA_API_URL: this.configService.get('EFATURA_API_URL') || '',
                } as any,
            });

            this.client = new Client(
                {
                    name: "advocatus-api-client",
                    version: "1.0.0",
                },
                {
                    capabilities: {},
                }
            );

            this.logger.log('Conectado ao MCP Legal Server com sucesso.');
        } catch (error: any) {
            this.logger.error(`Falha ao conectar ao servidor MCP: ${error?.message || error}`);
        }
    }

    async onModuleDestroy() {
        if (this.transport) {
            await this.transport.close();
            this.logger.log('Conexão MCP encerrada.');
        }
    }

    async callTool(name: string, args: any) {
        if (!this.client) {
            throw new Error('Cliente MCP não inicializado');
        }
        return await this.client.callTool({
            name,
            arguments: args,
        });
    }

    async listTools() {
        if (!this.client) {
            throw new Error('Cliente MCP não inicializado');
        }
        return await this.client.listTools({});
    }
}
