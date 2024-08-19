import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  AZURE_STORAGE: { CONNECTION_STRING: string; CONTAINER_NAME: string }
  LLAMA_CLOUD: { API_KEY: string; API_URL: string }

  constructor() {
    this.AZURE_STORAGE = {
      CONNECTION_STRING: this.getOrThrow('AZURE_STORAGE_CONNECTION_STRING'),
      CONTAINER_NAME: this.getOrThrow('AZURE_STORAGE_CONTAINER_NAME'),
    }
    this.LLAMA_CLOUD = {
      API_KEY: this.getOrThrow('LLAMA_CLOUD_API_KEY'),
      API_URL: this.getOrThrow('LLAMA_CLOUD_API_URL'),
    }
  }

  private getOrThrow(key: string): string {
    const value = process.env[key]
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value
  }
}
