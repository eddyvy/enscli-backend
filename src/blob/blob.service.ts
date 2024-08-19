import { BlobServiceClient } from '@azure/storage-blob'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '../config'

@Injectable()
export class BlobService {
  constructor(private readonly config: ConfigService) {}

  async saveBlob(content: Blob, blobPath: string): Promise<void> {
    const config = this.config.AZURE_STORAGE
    const connectionString = config.CONNECTION_STRING
    const containerName = config.CONTAINER_NAME

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    if (!(await containerClient.exists()))
      throw new Error('Azure container does not exist')

    const blobClient = containerClient.getBlockBlobClient(blobPath)
    await blobClient.upload(content, content.size)
  }
}
