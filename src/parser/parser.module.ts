import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ParserService } from './parser.service'

@Module({
  imports: [HttpModule],
  providers: [ParserService],
  exports: [ParserService],
})
export class ParserModule {}
