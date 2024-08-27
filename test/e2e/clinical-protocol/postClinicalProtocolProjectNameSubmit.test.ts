import { BlobServiceClient } from '@azure/storage-blob'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initTest } from '../../helper/api'
import { authHeader } from '../../helper/auth'
import { setEnv } from '../../helper/env'
import { mockAzureStorageBlob } from '../../mocks/azure-storage-blob'

jest.mock('@azure/storage-blob')
const mockFrom = BlobServiceClient.fromConnectionString as jest.Mock
mockFrom.mockImplementation(mockAzureStorageBlob.fromConnectionString)

describe('POST /clinical-protocl/:project_name/submit', () => {
  const url = (projectName: string) =>
    `/clinical-protocol/${projectName}/submit`

  let app: INestApplication

  const requestBody = {
    filename: 'example.txt',
    content: 'new content to submit',
  }

  beforeAll(() => {
    setEnv()
  })

  beforeEach(async () => {
    app = await initTest()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should return 201 with correct response', async () => {
    mockAzureStorageBlob.exists.mockResolvedValueOnce(true)

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)
      .send(requestBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ success: true })

    expect(mockAzureStorageBlob.fromConnectionString).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.fromConnectionString).toHaveBeenNthCalledWith(
      1,
      'connection-string'
    )
    expect(mockAzureStorageBlob.getContainerClient).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.getContainerClient).toHaveBeenNthCalledWith(
      1,
      'container-name'
    )
    expect(mockAzureStorageBlob.exists).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.getBlockBlobClient).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.getBlockBlobClient).toHaveBeenNthCalledWith(
      1,
      'testing_proj/example.txt'
    )
    expect(mockAzureStorageBlob.upload).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.upload).toHaveBeenNthCalledWith(
      1,
      Buffer.from('new content to submit'),
      21
    )
  })
})
