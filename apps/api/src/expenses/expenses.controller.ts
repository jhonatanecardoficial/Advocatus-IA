import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ExpensesService, CreateExpenseDto, UpdateExpenseDto } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ExpenseCategory } from '@prisma/client';

const CreateExpenseSchema = z.object({
    matter_id: z.string().cuid(),
    task_id: z.string().cuid().optional(),
    description: z.string().min(1).max(500),
    category: z.nativeEnum(ExpenseCategory),
    amount: z.number().positive(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    billable: z.boolean().optional(),
});

const UpdateExpenseSchema = z.object({
    description: z.string().min(1).max(500).optional(),
    category: z.nativeEnum(ExpenseCategory).optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    billable: z.boolean().optional(),
    task_id: z.string().cuid().optional(),
});

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(CreateExpenseSchema))
    create(@CurrentUser() user: RequestUser, @Body() dto: CreateExpenseDto) {
        return this.expensesService.create(user.tenantId, user.id, dto);
    }

    @Get('matter/:matterId')
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    findByMatter(@CurrentUser() user: RequestUser, @Param('matterId') matterId: string) {
        return this.expensesService.findByMatter(user.tenantId, matterId);
    }

    @Get('matter/:matterId/summary')
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    getSummaryByMatter(@CurrentUser() user: RequestUser, @Param('matterId') matterId: string) {
        return this.expensesService.getSummaryByMatter(user.tenantId, matterId);
    }

    @Get(':id')
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.expensesService.findOne(user.tenantId, id);
    }

    @Put(':id')
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    @UsePipes(new ZodValidationPipe(UpdateExpenseSchema))
    update(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body() dto: UpdateExpenseDto,
    ) {
        return this.expensesService.update(user.tenantId, id, dto);
    }

    @Delete(':id')
    @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
    delete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.expensesService.delete(user.tenantId, id);
    }
}
