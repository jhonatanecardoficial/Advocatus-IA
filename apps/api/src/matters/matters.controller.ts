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
import { MattersService } from './matters.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import {
    CreateMatterSchema,
    UpdateMatterSchema,
    MatterFiltersSchema,
    CreateMatterDto,
    UpdateMatterDto,
} from './dto/matter.dto'

@Controller('matters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MattersController {
    constructor(private readonly mattersService: MattersService) { }

    @Post()
    @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(CreateMatterSchema))
    create(@CurrentUser() user: RequestUser, @Body() dto: CreateMatterDto) {
        return this.mattersService.create(user.tenantId, dto)
    }

    @Get()
    findAll(@CurrentUser() user: RequestUser, @Query() query: Record<string, string>) {
        const filters = MatterFiltersSchema.parse(query)
        return this.mattersService.findAll(user.tenantId, filters)
    }

    @Get(':id')
    findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.mattersService.findOne(user.tenantId, id)
    }

    @Put(':id')
    @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
    @UsePipes(new ZodValidationPipe(UpdateMatterSchema))
    update(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body() dto: UpdateMatterDto,
    ) {
        return this.mattersService.update(user.tenantId, id, dto)
    }

    @Delete(':id')
    @Roles('SOCIO', 'ADMIN')
    remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.mattersService.remove(user.tenantId, id)
    }

    @Get(':id/timeline')
    getTimeline(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.mattersService.getTimeline(user.tenantId, id)
    }
}
