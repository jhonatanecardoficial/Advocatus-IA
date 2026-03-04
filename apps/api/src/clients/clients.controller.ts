import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { ClientsService } from './clients.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import {
    CreateClientSchema,
    UpdateClientSchema,
    ClientFiltersSchema,
    CreateClientDto,
    UpdateClientDto,
    ClientFiltersDto,
} from './dto/client.dto'

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(CreateClientSchema))
    create(@CurrentUser() user: RequestUser, @Body() dto: CreateClientDto) {
        return this.clientsService.create(user.tenantId, dto)
    }

    @Get()
    findAll(
        @CurrentUser() user: RequestUser,
        @Query() query: ClientFiltersDto,
    ) {
        const filters = ClientFiltersSchema.parse(query)
        return this.clientsService.findAll(user.tenantId, filters)
    }

    @Get(':id')
    findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.clientsService.findOne(user.tenantId, id)
    }

    @Put(':id')
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN')
    @UsePipes(new ZodValidationPipe(UpdateClientSchema))
    update(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body() dto: UpdateClientDto,
    ) {
        return this.clientsService.update(user.tenantId, id, dto)
    }

    @Delete(':id')
    @Roles('SOCIO', 'ADMIN')
    remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.clientsService.remove(user.tenantId, id)
    }
}
