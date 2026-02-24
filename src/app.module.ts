import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BondsModule } from './bonds/bonds.module';

@Module({
  imports: [BondsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
