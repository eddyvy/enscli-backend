import { MultipartFile } from '@fastify/multipart'
import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { BlobService } from '../blob'
import { MultipartData, MultipartInterceptor } from '../multipart'
import { ClinicalProtocolService } from './clinical-protocol.service'

@Controller('clinical-protocol')
export class ClinicalProtocolController {
  private readonly ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED =
    'File extension not supported'
  private readonly SUPPORTED_EXTENSIONS = ['pdf', 'txt', 'md', 'csv']

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
    if (
      !this.SUPPORTED_EXTENSIONS.includes(
        file?.filename?.split('.').at(-1)?.toLowerCase()
      )
    )
      throw new BadRequestException(this.ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED)

    const buffer = await file.toBuffer()
    await this.blobService.saveBlob(buffer, `${projectName}/${file.filename}`)
    return { success: true }
  }
}
