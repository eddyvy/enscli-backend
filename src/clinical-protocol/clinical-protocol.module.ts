import { Module } from '@nestjs/common'
import { BlobModule } from '../blob'
import { ClinicalProtocolController } from './clinical-protocol.controller'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Module({
  imports: [BlobModule],
  providers: [ClinicalProtocolService],
  controllers: [ClinicalProtocolController],
})
export class ClinicalProtocolModule {}
