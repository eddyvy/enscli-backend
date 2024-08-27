import { Injectable } from '@nestjs/common'
import { BlobService } from '../blob'
import { ChunkService } from '../chunk'
import { ParserService } from '../parser'
import {
  ClinicalProtocolChunkDto,
  ClinicalProtocolParseDto,
  ClinicalProtocolSubmitDto,
} from './dto'

@Injectable()
export class ClinicalProtocolService {
  constructor(
    private readonly blobService: BlobService,
    private readonly parserService: ParserService,
    private readonly chunkService: ChunkService
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

  async chunk(
    projectName: string,
    dto: ClinicalProtocolChunkDto
  ): Promise<string[]> {
    const fileBlob = await this.blobService.getBlob(
      `${projectName}/${dto.filename}`
    )
    const content = await fileBlob.text()
    const chunks = await this.chunkService.createChunks(content)

    return chunks
  }
}
