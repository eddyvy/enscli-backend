import { BlobServiceClient } from '@azure/storage-blob'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { initTest } from '../../helper/api'
import { authHeader } from '../../helper/auth'
import { setEnv } from '../../helper/env'
import { mockAzureStorageBlob } from '../../mocks/azure-storage-blob'

jest.mock('@azure/storage-blob')
const mockFrom = BlobServiceClient.fromConnectionString as jest.Mock
mockFrom.mockImplementation(mockAzureStorageBlob.fromConnectionString)

describe('POST /clinical-protocl/:project_name/upload', () => {
  const url = (projectName: string) =>
    `/clinical-protocol/${projectName}/upload`

  let app: INestApplication

  const testFile = Buffer.from('example file content')

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
    mockAzureStorageBlob.exists.mockResolvedValue(true)

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)
      .attach('file', testFile, {
        contentType: 'multipart/form-data',
        filename: 'example.pdf',
      })

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
      'testing_proj/example.pdf'
    )
    expect(mockAzureStorageBlob.upload).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.upload).toHaveBeenNthCalledWith(1, testFile, 20)
  })

  it('Should return 400 with not supported file extension', async () => {
    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)
      .attach('file', testFile, {
        contentType: 'multipart/form-data',
        filename: 'example.exe',
      })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'File extension not supported',
      error: 'Bad Request',
    })
  })

  it('Should return 400 with no file', async () => {
    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'multipart/form-data is required',
      error: 'Bad Request',
    })
  })

  it('Should return 401 with invalid auth', async () => {
    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set({ Authorization: 'Basic invalid_auth' })
      .attach('file', testFile, {
        contentType: 'multipart/form-data',
        filename: 'example.pdf',
      })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    })
  })

  it('Should return 500 with no container', async () => {
    mockAzureStorageBlob.exists.mockResolvedValue(false)

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)
      .attach('file', testFile, {
        contentType: 'multipart/form-data',
        filename: 'example.pdf',
      })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Azure container does not exist',
      error: 'Internal Server Error',
    })
  })
})
