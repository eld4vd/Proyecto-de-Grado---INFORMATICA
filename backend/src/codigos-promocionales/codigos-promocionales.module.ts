import { Module } from '@nestjs/common';
import { CodigosPromocionalesService } from './codigos-promocionales.service';
import { CodigosPromocionalesController } from './codigos-promocionales.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CodigosPromocionalesController],
  providers: [CodigosPromocionalesService],
  exports: [CodigosPromocionalesService],
})
export class CodigosPromocionalesModule {}
