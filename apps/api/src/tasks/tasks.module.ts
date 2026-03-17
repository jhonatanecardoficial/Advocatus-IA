import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { LegalDeadlineService } from './legal-deadline.service'

@Module({
    controllers: [TasksController],
    providers: [TasksService, LegalDeadlineService],
    exports: [TasksService, LegalDeadlineService],
})
export class TasksModule { }
