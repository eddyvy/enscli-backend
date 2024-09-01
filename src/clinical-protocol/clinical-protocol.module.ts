import { Module } from '@nestjs/common'
import { AiManagerModule } from '../ai-manager'
import { ParserModule } from '../parser'
import { StorageModule } from '../storage'
import { ClinicalProtocolController } from './clinical-protocol.controller'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Module({
  imports: [StorageModule, ParserModule, AiManagerModule],
  providers: [ClinicalProtocolService],
  controllers: [ClinicalProtocolController],
})
export class ClinicalProtocolModule {}
