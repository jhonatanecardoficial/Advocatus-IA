# Documentação Técnica - Assinatura Digital Qualificada (QES)

Este documento detalha a arquitetura e implementação da Assinatura Digital Qualificada (QES) no projeto Advocatus IA.

## 1. Visão Geral
A funcionalidade permite a assinatura de ficheiros PDF com validade jurídica plena, utilizando o Cartão de Cidadão (CC) e a Chave Móvel Digital (CMD) através da integração com os serviços da AMA (Agência para a Modernização Administrativa).

## 2. Arquitetura

### 2.1 Backend (NestJS)
- **Service**: `QesService` gere a lógica de hashing e comunicação OIDC.
- **Controller**: `QesController` expõe a API para o frontend.
- **Base de Dados**: Tabela `SignedDocument` no PostgreSQL (via Prisma).

### 2.2 Frontend (Next.js)
- **Componentes**: 
  - `QesSignatureModal`: Modal de seleção e execução da assinatura.
  - `SignedDocumentsPanel`: Visualização dos documentos assinados.
- **Integração**: Aba dedicada no `MatterDetail`.

## 3. Fluxos de Assinatura

### 3.1 Cartão de Cidadão (Local Middleware)
1. O frontend solicita ao backend o Hash do documento original.
2. O frontend comunica com o Middleware local da AMA (`localhost:13894`) via POST.
3. O Middleware solicita o PIN ao utilizador e assina o hash usando o chip do cartão.
4. O frontend envia a assinatura resultante para o backend.
5. O backend injeta a assinatura no PDF e arquiva o documento assinado.

### 3.2 Chave Móvel Digital (OIDC)
1. O backend gera um pedido OIDC e devolve o URL de autorização.
2. O utilizador é redirecionado ou autentica-se via popup.
3. Após aprovação, o backend processa o callback e assina o documento via servidor da AMA.

## 4. Segurança
- Validação de certificados.
- Integridade garantida via SHA-256.
- RLS (Row Level Security) para isolamento de dados por Tenant.

## 5. Manutenção
As chaves e segredos OIDC devem ser configurados nas variáveis de ambiente:
- `AMA_CLIENT_ID`
- `AMA_CLIENT_SECRET`
- `AMA_REDIRECT_URI`
