import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

import { resourceFromAttributes } from '@opentelemetry/resources';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

// Configuramos o SDK global do OpenTelemetry para a API NestJS
// Este ficheiro DEVE ser importado antes de qualquer outra dependência no main.ts

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';

export const otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
        'service.name': 'advocatus-api',
        'service.version': '1.0.0',
        'deployment.environment': 'development',
        'env': 'development', // Fallback for Grafana app-metrics.json
    }),
    traceExporter: new OTLPTraceExporter({
        url: otlpEndpoint,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: otlpEndpoint,
        }),
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
            url: otlpEndpoint,
        }),
    ),
    instrumentations: [
        getNodeAutoInstrumentations({
            // Desativar métricas do FS (File System) pois costumam fazer muito ruído
            '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
        new FastifyInstrumentation(),
        new NestInstrumentation(),
    ],
});

// Tratamento no shutdown graceful
process.on('SIGTERM', () => {
    otelSDK
        .shutdown()
        .then(
            () => console.log('OpenTelemetry SDK desligado corretamente.'),
            (err) => console.log('Erro ao desligar OpenTelemetry SDK', err),
        )
        .finally(() => process.exit(0));
});
