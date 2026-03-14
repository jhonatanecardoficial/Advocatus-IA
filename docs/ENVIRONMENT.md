# Configuração do Ambiente de Desenvolvimento

Este documento descreve as configurações necessárias para rodar o projeto localmente.

## Portas do Sistema

| Serviço | Porta | Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (Next.js)** | **3001** | Interface principal do sistema. |
| **Grafana** | **3000** | Dashboard de métricas e monitoramento. |
| **API Backend (NestJS)** | **4000** | Endpoints da API e serviços auxiliares. |

## Como rodar a Aplicação

Para iniciar o ambiente de desenvolvimento na porta correta:

```bash
# Na raiz do projeto
npm run dev
```

> [!IMPORTANT]
> A porta padrão do Next.js (3000) está ocupada pelo Grafana. O projeto está configurado para subir automaticamente na porta **3001**. Se houver conflito, verifique processos rodando na porta 3001.

## Verificação de Processos

Se precisar liberar a porta 3001 no Windows:
```powershell
netstat -ano | findstr :3001
# Identifique o PID e mate o processo
taskkill /PID <PID> /F
```
