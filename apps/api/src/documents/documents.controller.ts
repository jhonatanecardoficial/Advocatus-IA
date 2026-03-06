import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { DocumentsService } from './documents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import {
    GetUploadUrlSchema,
    ConfirmUploadSchema,
    GetUploadUrlDto,
    ConfirmUploadDto,
} from './dto/document.dto'

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload-url')
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(GetUploadUrlSchema))
    getUploadUrl(@CurrentUser() user: RequestUser, @Body() dto: GetUploadUrlDto) {
        return this.documentsService.getUploadUrl(user.tenantId, user.id, dto)
    }

    @Post('confirm-upload')
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(ConfirmUploadSchema))
    confirmUpload(@CurrentUser() user: RequestUser, @Body() dto: ConfirmUploadDto) {
        return this.documentsService.confirmUpload(user.tenantId, user.id, dto)
    }

    @Get(':id/download-url')
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN', 'CLIENTE')
    getDownloadUrl(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.documentsService.getDownloadUrl(user.tenantId, id)
    }
}
