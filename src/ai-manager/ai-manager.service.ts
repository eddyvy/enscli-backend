import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import { ConfigService } from '../config'

@Injectable()
export class AiManagerService {
  private readonly apiUrl: string
  private readonly apiAuth: string

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService
  ) {
    this.apiAuth = `Basic ${Buffer.from(
      `${config.AI_MANAGER.API_AUTH_USER}:${config.AI_MANAGER.API_AUTH_PASSWORD}`
    ).toString('base64')}`
    this.apiUrl = config.AI_MANAGER.API_URL
  }

  async embed(fileBlob: Blob, project: string) {
    const formData = new FormData()
    formData.append('file', fileBlob, 'file')
    formData.append('embde_model', this.config.AI.EMBEDDING.MODEL)
    formData.append(
      'embedding_dimension',
      this.config.AI.EMBEDDING.DIMENSIONS.toString()
    )
    formData.append(
      'buffer_size',
      this.config.AI.EMBEDDING.BUFFER_SIZE.toString()
    )
    formData.append(
      'breakpoint_percentile_threshold',
      this.config.AI.EMBEDDING.BREAKPOINT_PERCENTILE_THRESHOLD.toString()
    )

    const postUrl = `${this.apiUrl}/${project}/embed`
    const postHeaders = {
      'Content-Type': 'multipart/form-data',
      Authorization: this.apiAuth,
    }

    await this.http.axiosRef.post(postUrl, formData, {
      headers: postHeaders,
    })
  }

  async chat(project: string, message: string, sessionId?: string) {
    const postUrl = `${this.apiUrl}/${project}/chat`
    const postHeaders = {
      'Content-Type': 'application/json',
      Authorization: this.apiAuth,
    }

    sessionId = sessionId || this.generateSessionId()

    const body = {
      message,
      session_id: sessionId,
      model: this.config.AI.CHAT.MODEL,
      temperature: this.config.AI.CHAT.TEMPERATURE,
      top_k: this.config.AI.CHAT.TOP_K,
      embed_model: this.config.AI.EMBEDDING.MODEL,
      embedding_dimension: this.config.AI.EMBEDDING.DIMENSIONS,
    }

    const res = await this.http.axiosRef.post<{ response: string }>(
      postUrl,
      body,
      {
        headers: postHeaders,
      }
    )

    if (!res.data?.response)
      throw new InternalServerErrorException('AI Manager "response" is empty')

    return { response: res.data.response, sessionId }
  }

  private generateSessionId(): string {
    const now = DateTime.now().toISO()
    const randomString = Math.random().toString(36)
    const hash = crypto.createHash('md5')
    hash.update(randomString + now)
    return hash.digest('hex')
  }
}
