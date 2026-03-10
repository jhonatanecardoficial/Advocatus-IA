# Task 011 - Pesquisa IA (RAG Básico)

## Contexto
Diferenciar o Advocatus IA no mercado português através de uma ferramenta de pesquisa inteligente que consulta fontes oficiais (DRE, dados.justica.gov.pt).

## Escopo
1. **RAG (Retrieval-Augmented Generation)**:
   - Utilização de `pgvector` no Supabase.
   - Embeddings via OpenAI (`text-embedding-3-small`).
   - Ingestão de legislação PT (amostra inicial).
2. **Interface de Chat**:
   - Layout focado em produtividade.
   - Histórico de mensagens (opcional para o MVP).
   - Referências directas aos artigos da lei.

## Segurança e Ética
- Disclaimer obrigatório em todas as respostas indicando que se trata de uma ferramenta de apoio e não substitui consulta jurídica.
- Logging de todas as queries para auditoria e melhoria do modelo.

## Fontes de Dados
- Diário da República Eletrónico (DRE.pt).
- dados.gov.pt (Datasets de justiça).
