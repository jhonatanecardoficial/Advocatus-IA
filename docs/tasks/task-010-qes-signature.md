# Task 010: Assinatura Digital Qualificada (QES)

## Visão Geral
Integrar a capacidade de solicitar e verificar Assinaturas Digitais Qualificadas (QES) em documentos carregados no sistema, utilizando a **Chave Móvel Digital (CMD)** através do ecossistema **Autenticação.gov**.

## Objetivos
- [ ] Implementar fluxo de solicitação de assinatura CMD.
- [ ] Integrar com SDK/API da AMA para assinatura de PDFs.
- [ ] Validar a integridade e validade jurídica da assinatura no backend.
- [ ] Notificar as partes interessadas após a conclusão da assinatura.

## Arquitetura Proposta

### Backend (NestJS)
- **QesModule**: Módulo dedicado para lidar com integrações externas (AMA/Multicert).
- **QesService**: 
  - `generateSignatureRequest`: Inicia o processo com a CMD do utilizador.
  - `webhookHandler`: Recebe a confirmação de assinatura da AMA.
  - `verifySignature`: Utiliza bibliotecas de validação de PDF/Digital Signature para confirmar o PAdES (PDF Advanced Electronic Signatures).

### Frontend (Next.js)
- **DocumentActionButtons**: Adicionar opção "Solicitar Assinatura QES".
- **QesSignatureModal**: Modal interativo para introdução do número de telemóvel e PIN da CMD.
- **SignatureStatusIndicator**: Badge visual no documento indicando o estado (Pendente, Assinado, Inválido).

## Requisitos Técnicos
- **Protocolos**: OAuth2 / SAML (para Autenticação.gov).
- **Assinatura**: PAdES (LTV - Long Term Validation recomendado).
- **Segurança**: Armazenamento seguro de hashes e metadados de assinatura no Supabase.

## Plano de Execução
1. **Fase de Pesquisa**: Obter chaves de API e documentação oficial da AMA/Autenticação.gov.
2. **Desenvolvimento Core**: Implementar o serviço de backend para comunicação com o proxy de assinatura.
3. **Integração UI**: Criar componentes de requisição de assinatura no detalhe do processo.
4. **Verificação**: Testes em ambiente de sandbox (Pre-produção).

## Referências
- [Autenticação.gov - Assinatura Digital](https://www.autenticacao.gov.pt/a-assinatura-eletronica)
- [AMA Documentação Técnica](https://ama.gov.pt/)
