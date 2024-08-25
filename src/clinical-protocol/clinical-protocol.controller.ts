import { MultipartFile } from '@fastify/multipart'
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '../auth'
import { BlobService } from '../blob'
import { MultipartData, MultipartInterceptor } from '../multipart'
import { ClinicalProtocolService } from './clinical-protocol.service'
import { ClinicalProtocolParseDto, ClinicalProtocolSubmitDto } from './dto'

@UseGuards(AuthGuard)
@Controller('clinical-protocol')
export class ClinicalProtocolController {
  private readonly ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED =
    'File extension not supported'
  private readonly ERR_MSG_FILE_PARSE_TEXT =
    'Parsing is not necessary for text files'
  private readonly ERR_MSG_FILE_SUBMIT_NO_TEXT = 'Submit needs a text file'
  private readonly SUPPORTED_EXTENSIONS = [
    'pdf',
    'txt',
    'md',
    'csv',
    'doc',
    'docx',
    'docm',
    'dot',
    'dotx',
    'dotm',
    'rtf',
    'wps',
    'wpd',
    'sxw',
    'stw',
    'sxg',
    'pages',
    'mw',
    'mcw',
    'uot',
    'uof',
    'uos',
    'uop',
    'ppt',
    'pptx',
    'pot',
    'pptm',
    'potx',
    'potm',
    'key',
    'odp',
    'odg',
    'otp',
    'fopd',
    'sxi',
    'sti',
    'epub',
    'html',
    'htm',
    'xls',
    'xlsx',
    'xlsm',
    'xlsb',
    'xlw',
    'csv',
    'dif',
    'sylk',
    'slk',
    'prn',
    'numbers',
    'et',
    'ods',
    'fods',
    'uos1',
    'uos2',
    'dbf',
    'wk1',
    'wk2',
    'wk3',
    'wk4',
    'wks',
    'wq1',
    'wq2',
    'wb1',
    'wb2',
    'wb3',
    'qpw',
    'xlr',
    'eth',
    'tsv',
  ]
  private readonly TEXT_EXTENSIONS = ['txt', 'md', 'csv']

  constructor(
    private readonly blobService: BlobService,
    private readonly clinicalProtocolService: ClinicalProtocolService
  ) {}

  @UseInterceptors(MultipartInterceptor)
  @Post('/:project_name/upload')
  async postClinicalProtocolProjectNameUpload(
    @MultipartData('file') file: MultipartFile,
    @Param('project_name') projectName: string
  ) {
    this.checkFileExtension(file?.filename)

    const buffer = await file.toBuffer()
    await this.blobService.saveBlob(buffer, `${projectName}/${file.filename}`)
    return { success: true }
  }

  @Post('/:project_name/parse')
  async postClinicalProtocolProjectNameParse(
    @Param('project_name') projectName: string,
    @Body() dto: ClinicalProtocolParseDto
  ) {
    this.checkFileExtension(dto.filename)
    if (this.TEXT_EXTENSIONS.includes(dto.getFileExtension()))
      throw new BadRequestException(this.ERR_MSG_FILE_PARSE_TEXT)

    const parsedContent = await this.clinicalProtocolService.parse(
      projectName,
      dto
    )
    return { content: parsedContent }
  }

  @Post('/:project_name/submit')
  async postClinicalProtocolProjectNameSubmit(
    @Param('project_name') projectName: string,
    @Body() dto: ClinicalProtocolSubmitDto
  ) {
    if (!dto.filename || !this.TEXT_EXTENSIONS.includes(dto.getFileExtension()))
      throw new BadRequestException(this.ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED)

    await this.clinicalProtocolService.submit(projectName, dto)
    return { success: true }
  }

  private checkFileExtension(filename?: string) {
    if (
      !filename ||
      !this.SUPPORTED_EXTENSIONS.includes(
        filename.split('.').at(-1)?.toLowerCase()
      )
    )
      throw new BadRequestException(this.ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED)
  }
}
