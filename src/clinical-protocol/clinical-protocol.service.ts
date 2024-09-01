import { MultipartFile } from '@fastify/multipart'
import { Injectable } from '@nestjs/common'
import { AiManagerService } from '../ai-manager'
import { ParserService } from '../parser'
import { StorageService } from '../storage'
import {
  ClinicalProtocolChatDto,
  ClinicalProtocolEmbedDto,
  ClinicalProtocolParseDto,
  ClinicalProtocolSubmitDto,
} from './dto'

@Injectable()
export class ClinicalProtocolService {
  constructor(
    private readonly storageService: StorageService,
    private readonly parserService: ParserService,
    private readonly aiManagerService: AiManagerService
  ) {}

  async upload(projectName: string, file: MultipartFile) {
    await this.storageService.uploadFile(
      file.file,
      `${projectName}/${file.filename}`
    )
  }

  async parse(projectName: string, dto: ClinicalProtocolParseDto) {
    const filePath = `${projectName}/${dto.filename}`
    const fileBuffer = await this.storageService.downloadFile(filePath)
    const textContent = await this.parserService.parseBinaryToText(
      fileBuffer,
      dto.filename,
      dto.lang,
      dto.parsing_instructions
    )

    await this.storageService.uploadFile(
      Buffer.from(textContent),
      `${projectName}/parsed_${dto.getFileNameWithExtension('md')}`
    )

    return textContent
  }

  async submit(projectName: string, dto: ClinicalProtocolSubmitDto) {
    await this.storageService.uploadFile(
      Buffer.from(dto.content),
      `${projectName}/${dto.filename}`
    )
  }

  async embed(projectName: string, dto: ClinicalProtocolEmbedDto) {
    const filePath = `${projectName}/${dto.filename}`
    const fileBuffer = await this.storageService.downloadFile(filePath)

    await this.aiManagerService.embed(new Blob([fileBuffer]), projectName)
  }

  async chat(projectName: string, dto: ClinicalProtocolChatDto) {
    return this.aiManagerService.chat(projectName, dto.message, dto.sessionId)
  }
}
