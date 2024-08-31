import {
  GetObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Injectable } from '@nestjs/common'
import { Readable } from 'stream'
import { ConfigService } from '../config'

@Injectable()
export class StorageService {
  private readonly S3: S3Client
  private readonly bucketName: string

  constructor(config: ConfigService) {
    this.S3 = new S3Client({
      endpoint: config.STORAGE.AWS_ENDPOINT_URL_S3,
      region: config.STORAGE.AWS_REGION,
    })
    this.bucketName = config.STORAGE.BUCKET_NAME
  }

  async uploadFile(
    content: PutObjectCommandInput['Body'],
    path: string
  ): Promise<void> {
    const upload = new Upload({
      params: {
        Bucket: this.bucketName,
        Key: path,
        Body: content,
      },
      client: this.S3,
      queueSize: 3,
      partSize: 10 * 1024 * 1024,
    })

    await upload.done()
  }

  async downloadFile(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    })

    const response = await this.S3.send(command)

    if (response.Body instanceof Readable) {
      return this.streamToBuffer(response.Body)
    } else {
      throw new Error('Unexpected response body type')
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }
}
