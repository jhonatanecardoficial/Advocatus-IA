import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Delete,
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
    RequestSignatureSchema,
    GetUploadUrlDto,
    ConfirmUploadDto,
    RequestSignatureDto,
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

    @Get(':id/history')
    @Roles('SECRETARIA', 'ADVOGADO', 'SOCIO', 'ADMIN')
    getVersionHistory(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.documentsService.getVersionHistory(user.tenantId, id)
    }

    @Patch(':id/share')
    @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
    toggleShare(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body('isSharedWithClient') isSharedWithClient: boolean,
    ) {
        return this.documentsService.toggleShare(user.tenantId, id, isSharedWithClient)
    }

    @Patch(':id/request-signature')
    @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
    @UsePipes(new ZodValidationPipe(RequestSignatureSchema))
    requestSignature(
        @CurrentUser() user: RequestUser,
        @Param('id') id: string,
        @Body() dto: RequestSignatureDto,
    ) {
        // Garantir que o ID do param corresponde ao ID do body se necessário, ou apenas usar o param
        return this.documentsService.requestSignature(user.tenantId, user.id, { ...dto, documentId: id })
    }

    @Delete(':id')
    @Roles('ADVOGADO', 'SOCIO', 'ADMIN', 'SECRETARIA')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.documentsService.remove(user.tenantId, id)
    }
}
