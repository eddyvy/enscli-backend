import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { EmbedService } from './embed.service'

@Module({
  imports: [HttpModule],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
