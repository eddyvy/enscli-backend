import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  AI_MANAGER: {
    API_URL: string
    API_AUTH_USER: string
    API_AUTH_PASSWORD: string
  }
  AUTH: {
    USERS: string
    PASSWORD: string
  }
  EMBEDDING_MODEL_DEFAULT: string
  LLAMA_CLOUD: { API_KEY: string; API_URL: string }
  STORAGE: {
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_ENDPOINT_URL_S3: string
    AWS_REGION: string
    BUCKET_NAME: string
  }

  constructor() {
    this.AI_MANAGER = {
      API_URL: this.getOrThrow('ENSCLI_AI_MANAGER_URL'),
      API_AUTH_USER: this.getOrThrow('ENSCLI_AI_MANAGER_BASIC_AUTH_USER'),
      API_AUTH_PASSWORD: this.getOrThrow(
        'ENSCLI_AI_MANAGER_BASIC_AUTH_PASSWORD'
      ),
    }
    this.AUTH = {
      USERS: this.getOrThrow('BASIC_AUTH_USERS'),
      PASSWORD: this.getOrThrow('BASIC_AUTH_PASSWORD'),
    }
    this.EMBEDDING_MODEL_DEFAULT = this.getOrThrow('EMBEDDING_MODEL_DEFAULT')
    this.LLAMA_CLOUD = {
      API_KEY: this.getOrThrow('LLAMA_CLOUD_API_KEY'),
      API_URL: this.getOrThrow('LLAMA_CLOUD_API_URL'),
    }
    this.STORAGE = {
      AWS_ACCESS_KEY_ID: this.getOrThrow('AWS_ACCESS_KEY_ID'),
      AWS_SECRET_ACCESS_KEY: this.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      AWS_ENDPOINT_URL_S3: this.getOrThrow('AWS_ENDPOINT_URL_S3'),
      AWS_REGION: this.getOrThrow('AWS_REGION'),
      BUCKET_NAME: this.getOrThrow('BUCKET_NAME'),
    }
  }

  private getOrThrow(key: string): string {
    const value = process.env[key]
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value
  }
}
