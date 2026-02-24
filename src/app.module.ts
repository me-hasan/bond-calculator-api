import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BondsModule } from './bonds/bonds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BondsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
