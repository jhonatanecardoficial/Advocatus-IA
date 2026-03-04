import { PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema } from 'zod'

/**
 * Pipe de validação Zod — usa os schemas Zod directamente em vez de class-validator.
 * Muito mais legível, type-safe e sem decorators de classe.
 */
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema) { }

    transform(value: unknown, metadata?: ArgumentMetadata) {
        // Ignora a validação para decorators custom (como o @CurrentUser)
        if (metadata && !['body', 'query', 'param'].includes(metadata.type)) {
            return value;
        }

        const result = this.schema.safeParse(value)

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }))
            throw new BadRequestException({ message: 'Dados inválidos', errors })
        }

        return result.data
    }
}

