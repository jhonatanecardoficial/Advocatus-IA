# Task 014: Portal Seguro do Cliente

## Descrição do Funcionalidade

O "Portal Seguro do Cliente" é um ambiente isolado do software principal que permite aos advogados partilharem o progresso e os documentos de um processo (Matter) de forma segura com os respetivos clientes, sem a necessidade de lhes criar credenciais de acesso permanentes na plataforma.

A segurança baseia-se num **Token de Alta Entropia** único por processo, gerado a pedido do advogado e partilhado de forma "out-of-band" (ex: via WhatsApp, SMS, ou e-mail externo). Este token dá acesso limitado a uma vista isolada do processo.

## Estrutura de Dados e Segurança

- **Modelo `PortalAccess`**: Implementado na base de dados (Prisma) para gerir a relação 1:1 entre um `token` gerado de forma aleatória e segura e o respetivo id do processo (`matterId`).
  - Permite definir uma data de expiração (por defeito: 30 dias após geração).
  - Inclui flag booleana `isActive` para permitir revogação instantânea pelo advogado.

- **Modelo `Document` modificado**:
  - `isSharedWithClient` (Booleano): Funciona como controlo "Opt-in", prevenindo a partilha acidental. Por predefinição os documentos do processo são privados e têm de ser ativados um a um para serem vistos pelo cliente.

- **Modelo `Message` modificado**:
  - `isFromClient` (Booleano): Permite que o cliente escreva mensagens a partir do portal, guardando-as na feed temporal do respetivo processo e marcando a sua origem.

## Implementação Backend (NestJS)

Foi criado o módulo `PortalModule` em `apps/api/src/portal/`.

### Endpoints
- `POST /portal/matters/:matterId/generate`: Gera (ou regenera) e retorna um URL encriptado para o cliente.
- `GET /portal/access/:token`: Endpoint sem autenticação de Header (Bearer) regular, que utiliza em vez disso o URL Token. Valida validade e expiração. Retorna os detalhes do processo, lista dos documentos (apenas os partilhados) e histórico de mensagens.
- `POST /portal/access/:token/messages`: Permite ao cliente submeter mensagens para o chat global do processo.
- `PATCH /documents/:id/share`: Endpoint REST para o advogado definir explicitamente visibilidade de um documento.
- `DELETE /portal/:tokenId/revoke`: Inutiliza aquele link de segurança (altera `isActive` para `false`).

## Implementação Frontend (NextJS)

### Visão Advogado (`MatterDetail.tsx`)
- **PortalLinkButton**: Botão no painel lateral do Matter que aciona a criação do link seguro. Assim que gerado, exibe um botão para facilitar ao advogado o "Copy to clipboard".
- **DocumentListPanel**: Painel expandido de Documentos, permitindo através de um botão de ação rápida o "toggle" do campo `isSharedWithClient`.

### Visão Cliente (`/portal/[token]/page.tsx`)
- Layout intencionalmente isolado em `apps/web/app/portal/[token]/layout.tsx` (não acopla o layout de dashboard `TopNavigation` nem a Navbar principal).
- Apresenta um resumo de contexto (Nome do Processo, Data de Início).
- Componente `<PortalDocuments />`: Lista botões de download direto unicamente para os documentos que o advogado libertou.
- Componente `<PortalChat />`: Chat contínuo encriptado. Otimizado para leitura fácil por parte do cliente, as mensagens têm indicadores visuais para diferenciar se foram enviadas pelo Advogado ou originadas no lado do cliente.
