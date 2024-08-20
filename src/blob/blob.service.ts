import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '../config'

@Injectable()
export class BlobService {
  private readonly connectionStr: string
  private readonly containerName: string

  constructor(config: ConfigService) {
    this.connectionStr = config.AZURE_STORAGE.CONNECTION_STRING
    this.containerName = config.AZURE_STORAGE.CONTAINER_NAME
  }

  async saveBlob(content: Blob | Buffer, blobPath: string): Promise<void> {
    const blobClient = await this.getBlobClient(blobPath)
    let size = 0
    if (content instanceof Blob) {
      size = content.size
    } else {
      size = content.byteLength
    }
    await blobClient.upload(content, size)
  }

  async getBlob(blobPath: string): Promise<Blob> {
    const blobClient = await this.getBlobClient(blobPath)
    const downloadBlockBlobResponse = await blobClient.download()
    return downloadBlockBlobResponse.blobBody
  }

  private async getBlobClient(blobPath: string): Promise<BlockBlobClient> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionStr
    )
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName
    )

    if (!(await containerClient.exists()))
      throw new InternalServerErrorException('Azure container does not exist')

    return containerClient.getBlockBlobClient(blobPath)
  }
}
