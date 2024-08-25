import { Module } from '@nestjs/common'
import { BlobModule } from '../blob'
import { ParserModule } from '../parser'
import { ClinicalProtocolController } from './clinical-protocol.controller'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Module({
  imports: [BlobModule, ParserModule],
  providers: [ClinicalProtocolService],
  controllers: [ClinicalProtocolController],
})
export class ClinicalProtocolModule {}
