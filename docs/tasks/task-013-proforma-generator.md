# Task 013 - Proforma Generator

## Scope Delivered

1. **Geração de Proformas (Drafts)**: Implementação da funcionalidade que permite ao advogado gerar documentos de proforma (drafts de faturas) a partir de honorários e despesas registados num processo.
2. **Integração no Matter Detail**: Adição da aba "Faturação" no detalhe do processo (`MatterDetail.tsx`), permitindo acesso direto ao painel de drafts.
3. **Painel de Drafts (`InvoiceDraftPanel.tsx`)**: Componente que lista drafts existentes, permite configurar a taxa de IVA e gerar novos drafts.
4. **Exportação de PDF (Simulada)**: Funcionalidade de download de PDF draft via Base64, pronta para integração com serviços de PDF reais ou APIs de faturação futura.
5. **Backend Billing**: Endpoints integrados para listagem e criação de drafts associados ao tenant e ao processo.

## Public Interfaces

- `POST /api/v1/invoices/draft`: Cria um novo rascunho de fatura.
- `GET /api/v1/invoices?matter_id={id}`: Lista rascunhos de fatura para um processo específico.
- `GET /api/v1/invoices/:id/pdf`: Retorna o conteúdo Base64 para visualização do rascunho.

## Design implementation

- Respeita o Design System "Navy + Amber" (`#0F1D3A` e `#D4A853`).
- Interface limpa e focada em rigor jurírico.
- Geometria "Sharp" conforme as diretrizes do projeto.

## Next Steps (Fase 2)

- Integração com Autoridade Tributária (AT) para faturas reais.
- Assinatura digital qualificada nos PDFs gerados.
- Relatórios de rentabilidade avançados.
