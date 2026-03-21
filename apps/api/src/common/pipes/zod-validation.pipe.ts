import { PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema } from 'zod'

/**
 * Pipe de validação Zod — usa os schemas Zod directamente em vez de class-validator.
 * Muito mais legível, type-safe e sem decorators de classe.
 */
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema) { }

    transform(value: unknown, metadata?: ArgumentMetadata) {
        // Validar apenas o body por predefinição. Se quisermos validar query ou params
        // deveremos usar o pipe explicitamente no decorador: @Query(new ZodValidationPipe(...))
        if (metadata && metadata.type !== 'body') {
            return value;
        }

        const result = this.schema.safeParse(value)

        if (!result.success) {
            console.error("ZodValidationPipe failure:", { value, type: metadata?.type, errors: result.error.issues });
            const errors = result.error.issues.map((e: any) => ({
                field: e.path.join('.'),
                message: e.message,
            }))
            throw new BadRequestException({ message: 'Dados inválidos', errors })
        }

        return result.data
    }
}

