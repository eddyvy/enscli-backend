import { Injectable } from '@nestjs/common'
import { BlobService } from '../blob'
import { ParserService } from '../parser'
import { ClinicalProtocolParseDto, ClinicalProtocolSubmitDto } from './dto'

@Injectable()
export class ClinicalProtocolService {
  constructor(
    private readonly blobService: BlobService,
    private readonly parserService: ParserService
  ) {}

  async parse(projectName: string, dto: ClinicalProtocolParseDto) {
    const filePath = `${projectName}/${dto.filename}`
    const fileBlob = await this.blobService.getBlob(filePath)
    const textContent = await this.parserService.parseBinaryToText(
      fileBlob,
      dto.filename,
      dto.lang,
      dto.parsing_instructions
    )

    await this.blobService.saveBlob(
      Buffer.from(textContent),
      `${projectName}/parsed_${dto.getFileNameWithTxtExtension()}`
    )

    return textContent
  }

  async submit(projectName: string, dto: ClinicalProtocolSubmitDto) {
    await this.blobService.saveBlob(
      Buffer.from(dto.content),
      `${projectName}/${dto.filename}`
    )
  }
}
