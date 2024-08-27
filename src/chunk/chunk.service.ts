import { Injectable } from '@nestjs/common'

@Injectable()
export class ChunkService {
  async createChunks(content: string): Promise<string[]> {
    // TODO implement
    return []
  }
}
