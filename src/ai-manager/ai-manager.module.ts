import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AiManagerService } from './ai-manager.service'

@Module({
  imports: [HttpModule],
  providers: [AiManagerService],
  exports: [AiManagerService],
})
export class AiManagerModule {}
