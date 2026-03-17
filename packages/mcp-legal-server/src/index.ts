import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "advocatus-legal-intel",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Ferramentas Disponíveis
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_legislation",
        description: "Pesquisa legislação portuguesa atualizada no Diário da República Eletrónico.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Termo ou frase jurídica a pesquisar" },
          },
          required: ["query"],
        },
      },
      {
        name: "search_case_law",
        description: "Pesquisa jurisprudência (acórdãos) nos tribunais superiores portugueses (DGSI).",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Termo de pesquisa jurídica" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_tax_info",
        description: "Consulta e-fatura e informações fiscais do contribuinte (Requer chaves da AT).",
        inputSchema: {
          type: "object",
          properties: {
            nif: { type: "string", description: "NIF do contribuinte" },
          },
          required: ["nif"],
        },
      },
    ],
  };
});

/**
 * Lógica das Ferramentas
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_legislation") {
      const { query } = z.object({ query: z.string() }).parse(args);
      // FASE 3: Implementar scraping real ou API de terceiros
      return {
        content: [{ type: "text", text: `Pesquisando legislação por: ${query}... [Mock: Encontrado Decreto-Lei n.º X/2024 relacionado]` }],
      };
    }

    if (name === "search_case_law") {
      const { query } = z.object({ query: z.string() }).parse(args);
      return {
        content: [{ type: "text", text: `Pesquisando acórdãos por: ${query}... [Mock: Encontrado Acórdão do STJ de 15/01/2025]` }],
      };
    }

    if (name === "get_tax_info") {
      const { nif } = z.object({ nif: z.string() }).parse(args);
      
      const clientId = process.env.EFATURA_API_CLIENT_ID;
      if (!clientId) {
        return {
          content: [{ type: "text", text: "Erro: Credenciais do e-fatura não configuradas no .env" }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: `Consultando dados para o NIF ${nif} via API AT... (Sistema pronto para receber chaves)` }],
      };
    }

    throw new Error(`Ferramenta não encontrada: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Erro ao executar ferramenta: ${error.message}` }],
      isError: true,
    };
  }
});

/**
 * Inicialização
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Legal Intel MCP Server em execução via stdio");
}

main().catch((error) => {
  console.error("Falha no servidor MCP:", error);
  process.exit(1);
});
