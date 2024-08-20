import { MultipartFile } from '@fastify/multipart'
import { Controller, Param, Post, UseInterceptors } from '@nestjs/common'
import { BlobService } from '../blob'
import { MultipartData, MultipartInterceptor } from '../multipart'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Controller('clinical-protocol')
export class ClinicalProtocolController {
  constructor(
    private readonly blobService: BlobService,
    private readonly clinicalProtocolService: ClinicalProtocolService
  ) {}

  @UseInterceptors(MultipartInterceptor)
  @Post('/:project_name/upload')
  async postClinicalProtocol(
    @MultipartData('file') file: MultipartFile,
    @Param('project_name') projectName: string
  ) {
    const buffer = await file.toBuffer()
    await this.blobService.saveBlob(buffer, `${projectName}/${file.filename}`)
    return { success: true }
  }
}
