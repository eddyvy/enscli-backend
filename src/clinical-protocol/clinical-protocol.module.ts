import { Module } from '@nestjs/common'
import { EmbedModule } from '../embed'
import { ParserModule } from '../parser'
import { StorageModule } from '../storage'
import { ClinicalProtocolController } from './clinical-protocol.controller'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Module({
  imports: [StorageModule, ParserModule, EmbedModule],
  providers: [ClinicalProtocolService],
  controllers: [ClinicalProtocolController],
})
export class ClinicalProtocolModule {}
