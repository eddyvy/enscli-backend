import { HttpService } from '@nestjs/axios'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '../config'
import { sleep } from '../helper/time'
import { LlamaCloudParserResponse } from './parser.types'

@Injectable()
export class ParserService {
  private readonly ERR_MSG_FAIL_UPLOAD =
    'Llama Cloud Error. Parsing job. Fail to upload'
  private readonly ERR_MSG_PENDING_TIMEOUT =
    'Llama Cloud Error. Parsing job. Pending timeout'
  private readonly ERR_MSG_FAIL_PARSE = (status: string) =>
    `Llama Cloud Error. Parsing job. Status: ${status}`
  private readonly ERR_MSG_FAIL_DOWNLOAD =
    'Llama Cloud Error. Parsing job. Fail to download'

  private readonly apiUrl: string
  private readonly apiKey: string

  constructor(
    config: ConfigService,
    private readonly http: HttpService
  ) {
    this.apiUrl = config.LLAMA_CLOUD.API_URL
    this.apiKey = config.LLAMA_CLOUD.API_KEY
  }

  async parseBinaryToText(
    file: Buffer,
    filename: string,
    lang?: string,
    parsing_instructions?: string
  ): Promise<string> {
    const jobId = await this.uploadBinaryToLlamaCloud(
      file,
      filename,
      lang,
      parsing_instructions
    )

    return this.downloadTextFromLlamaCloud(jobId)
  }

  private async uploadBinaryToLlamaCloud(
    file: Buffer,
    filename: string,
    lang?: string,
    parsing_instructions?: string
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', new Blob([file]), filename)

    if (lang) formData.append('lang', lang)
    if (parsing_instructions)
      formData.append('parsing_instructions', parsing_instructions)

    const postUrl = `${this.apiUrl}/parsing/upload`
    const postHeaders = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
    const postRes = await this.http.axiosRef.post<LlamaCloudParserResponse>(
      postUrl,
      formData,
      {
        headers: postHeaders,
      }
    )

    if (!postRes?.data?.id || !postRes?.data?.status)
      throw new InternalServerErrorException(this.ERR_MSG_FAIL_UPLOAD)

    const jobId = postRes.data.id
    const getUrl = `${this.apiUrl}/parsing/job/${jobId}`
    const getHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }

    let status = postRes.data.status
    let times = 0
    while (status === 'PENDING') {
      if (times >= 60)
        throw new InternalServerErrorException(this.ERR_MSG_PENDING_TIMEOUT)

      await sleep(2000)
      const getRes = await this.http.axiosRef.get<LlamaCloudParserResponse>(
        getUrl,
        { headers: getHeaders }
      )
      status = getRes.data?.status
      times++
    }

    if (status !== 'SUCCESS')
      throw new InternalServerErrorException(
        this.ERR_MSG_FAIL_PARSE(status || 'UNKNOWN')
      )

    return jobId
  }

  private async downloadTextFromLlamaCloud(jobId: string): Promise<string> {
    const getUrl = `${this.apiUrl}/parsing/job/${jobId}/result/raw/markdown`
    const getHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
    const getRes = await this.http.axiosRef.get<string>(getUrl, {
      headers: getHeaders,
    })

    if (!getRes?.data || typeof getRes.data !== 'string')
      throw new InternalServerErrorException(this.ERR_MSG_FAIL_DOWNLOAD)

    return getRes.data
  }
}
