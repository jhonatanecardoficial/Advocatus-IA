# Sistema de Cronômetro Persistente (Time Tracker)

Este documento detalha a implementação do sistema de cronometragem de atividades para garantir precisão e persistência.

## Arquitetura Baseada em Timestamps

Diferente de contadores simples que dependem do estado da memória do componente, este sistema utiliza timestamps para calcular o tempo decorrido.

### Componentes Principais

1. **startTime**: Timestamp de quando o cronômetro foi iniciado pela última vez. Salvo no `localStorage`.
2. **accumulatedSeconds**: Segundos acumulados de sessões anteriores que já foram pausadas.
3. **isTimerRunning**: Estado booleano de execução.

### Lógica de Cálculo

O tempo total exibido é sempre:
`tempo_exibido = accumulatedSeconds + (agora - startTime)`

### Benefícios

- **Imunidade a Unmount**: Se o componente for removido da tela (ex: troca de aba interna ou navegação), o cálculo recomeça do ponto correto ao ser remontado.
- **Persistência entre Abas**: O sistema escuta eventos de `storage` para sincronizar o estado entre diferentes abas do navegador em tempo real.
- **Resiliência a Crash**: Se o navegador fechar ou o computador reiniciar, o tempo continua sendo calculado com base no `startTime` original.

## Localização do Código
`apps/web/components/TimeTracker.tsx`
