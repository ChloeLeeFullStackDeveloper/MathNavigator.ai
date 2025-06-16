import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai/ai.controller';
import { AIService } from './ai/ai.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AIController],
  providers: [AIService],
})
export class AppModule {}
