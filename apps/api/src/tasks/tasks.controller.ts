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
import { TasksService } from './tasks.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { CreateTaskSchema, UpdateTaskSchema, CreateTaskDto, UpdateTaskDto } from './dto/task.dto'

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(CreateTaskSchema))
    create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(user.tenantId, user.id, dto)
    }

    /** GET /tasks?matterId=xxx */
    @Get()
    findAll(
        @CurrentUser() user: RequestUser,
        @Query('matterId') matterId?: string,
        @Query('mine') mine?: string,
    ) {
        if (matterId) {
            return this.tasksService.findByMatter(user.tenantId, matterId)
        }
        return this.tasksService.findUpcoming(user.tenantId, mine === 'true' ? user.id : undefined)
    }

    @Put(':id')
    @UsePipes(new ZodValidationPipe(UpdateTaskSchema))
    update(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(user.tenantId, id, dto)
    }

    @Delete(':id')
    remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.tasksService.remove(user.tenantId, id)
    }
}
