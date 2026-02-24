import { Module } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { BondsController } from './bonds.controller';

@Module({
  controllers: [BondsController],
  providers: [BondsService],
  exports: [BondsService],
})
export class BondsModule {}
