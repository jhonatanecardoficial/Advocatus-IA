# Relatório de Restauração de Requisitos - Portugal (pt-PT) 🇵🇹

## Resumo Executivo
Este documento detalha a reversão crítica do sistema de localização pt-BR para pt-PT, após a identificação de um desvio grave dos requisitos originais do projeto. A aplicação foi restaurada para os padrões linguísticos, monetários e legais de Portugal.

## 1. Correções de Localização Aplicadas

### Interface e Navegação
- **Sidebar**: 
  - `Faturamento` -> `Faturação`
  - `Configurações` -> `Definições`
  - `Sair do Sistema` -> `Terminar Sessão`
- **TopNav**:
  - `MEMBRO PREMIUM` -> `PREMIUM MEMBER` (Padrão internacional solicitado)
  - Links de navegação validados.

### Modais e Formulários
- **AddMatterModal (Novo Processo)**:
  - `Ação` -> `Acção`
  - `fatos` -> `factos`
  - `objetivos` -> `objectivos`
  - `Salvando...` -> `Guardando...`
  - Referências: `PJe / e-SAJ` -> `CITIUS`
- **AddClientModal (Novo Cliente)**:
  - `CPF / CNPJ` -> `NIF / NIPC`
  - `Pessoa Física` -> `Pessoa Singular`
  - `Pessoa Jurídica` -> `Pessoa Colectiva`
  - `Cadastro` -> `Registo`
  - Identificação de email: `exemplo@dominio.pt` intercalado como placeholder.

### Dashboard e Inteligência
- **LegalIntelligenceDashboard**:
  - Fontes: Revertido de `STF/STJ/DOU` para `STJ/DGSI/DRE`.
  - Terminologia: `NF-e` -> `e-fatura`.
- **Billing Page**:
  - Moeda: `R$` -> `€ (EUR)`.
  - Locale: Formatação de data e números alterada para `pt-PT`.

## 2. Estabilização Técnica
- **Porta 3001**: Conflito `EADDRINUSE` resolvido através da terminação forçada do processo residual.
- **Build & Lint**: Executados com sucesso, garantindo que as alterações de terminologia não afectaram a integridade do código.

## 3. Próximos Passos Recomendados
- Auditoria de todos os campos de base de dados para garantir que não existem strings `pt-BR` persistidas.
- Teste de integração com APIs de tribunais portugueses (CITIUS).
- Validação final do fluxo de exportação SAF-T para conformidade com a Autoridade Tributária Portuguesa.

---
**Status Final**: ✅ Restaurado | [task.md](file:///C:/Users/E/.gemini/antigravity/brain/49dc0467-80fa-4478-8a6f-bc2d2565a337/task.md)
