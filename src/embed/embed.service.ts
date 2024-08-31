import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '../config'

@Injectable()
export class EmbedService {
  private readonly apiUrl: string
  private readonly apiAuth: string
  private readonly embeddingModelDefault: string

  constructor(
    config: ConfigService,
    private readonly http: HttpService
  ) {
    this.apiAuth = `Basic ${Buffer.from(
      `${config.AI_MANAGER.API_AUTH_USER}:${config.AI_MANAGER.API_AUTH_PASSWORD}`
    ).toString('base64')}`
    this.apiUrl = config.AI_MANAGER.API_URL
    this.embeddingModelDefault = config.EMBEDDING_MODEL_DEFAULT
  }

  async embed(fileBlob: Blob, project: string, model?: string) {
    const formData = new FormData()
    formData.append('file', fileBlob, 'file')
    formData.append('model', model || this.embeddingModelDefault)

    const postUrl = `${this.apiUrl}/${project}/embed`
    const postHeaders = {
      'Content-Type': 'multipart/form-data',
      Authorization: this.apiAuth,
    }

    await this.http.axiosRef.post(postUrl, formData, {
      headers: postHeaders,
    })
  }
}
