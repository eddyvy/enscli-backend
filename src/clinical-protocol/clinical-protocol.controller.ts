import { MultipartFile } from '@fastify/multipart'
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AiManagerFilter } from '../ai-manager'
import { AuthGuard } from '../auth'
import { MultipartData, MultipartInterceptor } from '../multipart'
import { ClinicalProtocolService } from './clinical-protocol.service'
import {
  ClinicalProtocolChatDto,
  ClinicalProtocolEmbedDto,
  ClinicalProtocolParseDto,
  ClinicalProtocolSubmitDto,
} from './dto'

@UseGuards(AuthGuard)
@Controller('clinical-protocol')
export class ClinicalProtocolController {
  private readonly ERR_MSG_FILE_EXTENSION_NOT_SUPPORTED =
    'File extension not supported'
  private readonly ERR_MSG_FILE_PARSE_TEXT =
    'Parsing is not necessary for text files'
  private readonly ERR_MSG_FILE_SUBMIT_NO_TEXT = 'Needs a text file'
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
    private readonly clinicalProtocolService: ClinicalProtocolService
  ) {}

  @UseInterceptors(MultipartInterceptor)
  @Post('/:project/upload')
  async postClinicalProtocolProjectNameUpload(
    @MultipartData('file') file: MultipartFile,
    @Param('project') projectName: string
  ) {
    this.checkFileExtension(file?.filename)

    await this.clinicalProtocolService.upload(projectName, file)
    return { success: true }
  }

  @Post('/:project/parse')
  async postClinicalProtocolProjectNameParse(
    @Param('project') projectName: string,
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

  @Post('/:project/submit')
  async postClinicalProtocolProjectNameSubmit(
    @Param('project') projectName: string,
    @Body() dto: ClinicalProtocolSubmitDto
  ) {
    if (!dto.filename || !this.TEXT_EXTENSIONS.includes(dto.getFileExtension()))
      throw new BadRequestException(this.ERR_MSG_FILE_SUBMIT_NO_TEXT)

    await this.clinicalProtocolService.submit(projectName, dto)
    return { success: true }
  }

  @Post('/:project/embed')
  @UseFilters(AiManagerFilter)
  async postClinicalProtocolProjectNameEmbed(
    @Param('project') projectName: string,
    @Body() dto: ClinicalProtocolEmbedDto
  ) {
    if (!dto.filename || !this.TEXT_EXTENSIONS.includes(dto.getFileExtension()))
      throw new BadRequestException(this.ERR_MSG_FILE_SUBMIT_NO_TEXT)

    await this.clinicalProtocolService.embed(projectName, dto)
    return { success: true }
  }

  @Post('/:project/chat')
  @UseFilters(AiManagerFilter)
  async postClinicalProtocolProjectNameChat(
    @Param('project') projectName: string,
    @Body() dto: ClinicalProtocolChatDto
  ) {
    return this.clinicalProtocolService.chat(projectName, dto)
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
