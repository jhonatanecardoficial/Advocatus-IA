import { Module } from '@nestjs/common';
import { QesController } from './qes.controller';
import { QesService } from './qes.service';

@Module({
  controllers: [QesController],
  providers: [QesService],
  exports: [QesService],
})
export class QesModule {}
