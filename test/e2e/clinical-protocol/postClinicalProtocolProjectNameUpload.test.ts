import { BlobServiceClient } from '@azure/storage-blob'
import { INestApplication } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as request from 'supertest'
import { initTest } from '../../helper/api'
import { setEnv } from '../../helper/env'

jest.mock('@azure/storage-blob')

describe('POST /clinical-protocl/:project_name/upload', () => {
  const url = (projectName: string) =>
    `/clinical-protocol/${projectName}/upload`

  let app: INestApplication

  const mockBlobClient = {
    upload: jest.fn(),
    download: jest.fn(),
  }
  const mockContainerClient = {
    getBlockBlobClient: jest.fn(() => mockBlobClient),
    exists: jest.fn(),
  }
  const mockServiceClient = {
    getContainerClient: jest.fn(() => mockContainerClient),
  }
  const mockFromConnectionString =
    BlobServiceClient.fromConnectionString as jest.Mock
  mockFromConnectionString.mockReturnValue(mockServiceClient)

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
    mockContainerClient.exists.mockResolvedValue(true)

    const testFilePath = path.join(__dirname, '../../data/example.pdf')
    const testFile = fs.readFileSync(testFilePath)

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .attach('file', testFilePath)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ success: true })

    expect(mockFromConnectionString).toHaveBeenCalledTimes(1)
    expect(mockFromConnectionString).toHaveBeenNthCalledWith(
      1,
      'connection-string'
    )
    expect(mockServiceClient.getContainerClient).toHaveBeenCalledTimes(1)
    expect(mockServiceClient.getContainerClient).toHaveBeenNthCalledWith(
      1,
      'container-name'
    )
    expect(mockContainerClient.exists).toHaveBeenCalledTimes(1)
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledTimes(1)
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenNthCalledWith(
      1,
      'testing_proj/example.pdf'
    )
    expect(mockBlobClient.upload).toHaveBeenCalledTimes(1)
    expect(mockBlobClient.upload).toHaveBeenNthCalledWith(1, testFile, 4842)
  })

  it('Should return 400 with no file', async () => {
    const res = await request(app.getHttpServer()).post(url('testing_proj'))

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      statusCode: 400,
      message: 'multipart/form-data is required',
      error: 'Bad Request',
    })
  })

  it('Should return 500 with no container', async () => {
    mockContainerClient.exists.mockResolvedValue(false)

    const testFilePath = path.join(__dirname, '../../data/example.pdf')

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .attach('file', testFilePath)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Azure container does not exist',
      error: 'Internal Server Error',
    })
  })
})
