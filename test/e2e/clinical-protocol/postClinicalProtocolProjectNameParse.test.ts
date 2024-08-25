import { BlobServiceClient } from '@azure/storage-blob'
import { INestApplication } from '@nestjs/common'
import * as nock from 'nock'
import * as request from 'supertest'
import { initTest } from '../../helper/api'
import { authHeader } from '../../helper/auth'
import { setEnv } from '../../helper/env'
import { mockAzureStorageBlob } from '../../mocks/azure-storage-blob'

jest.mock('../../../src/helper/time')
jest.mock('@azure/storage-blob')
const mockFrom = BlobServiceClient.fromConnectionString as jest.Mock
mockFrom.mockImplementation(mockAzureStorageBlob.fromConnectionString)

describe('POST /clinical-protocl/:project_name/parse', () => {
  const url = (projectName: string) => `/clinical-protocol/${projectName}/parse`

  let app: INestApplication

  const requestBody = {
    filename: 'example.pdf',
    lang: 'en',
    parsing_instructions: 'test parsing instructions',
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
    mockAzureStorageBlob.exists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)

    let uploadRequest = null

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, (_, req) => {
        uploadRequest = req
        return { id: 'abc-def-ghi', status: 'PENDING' }
      })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .times(3)
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .reply(200, { id: 'abc-def-ghi', status: 'SUCCESS' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi/result/raw/text')
      .reply(200, 'example text')

    const res = await request(app.getHttpServer())
      .post(url('testing_proj'))
      .set(authHeader)
      .send(requestBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ content: 'example text' })

    expect(mockAzureStorageBlob.fromConnectionString).toHaveBeenCalledTimes(2)
    expect(mockAzureStorageBlob.fromConnectionString).toHaveBeenNthCalledWith(
      1,
      'connection-string'
    )
    expect(mockAzureStorageBlob.fromConnectionString).toHaveBeenNthCalledWith(
      2,
      'connection-string'
    )
    expect(mockAzureStorageBlob.getContainerClient).toHaveBeenCalledTimes(2)
    expect(mockAzureStorageBlob.getContainerClient).toHaveBeenNthCalledWith(
      1,
      'container-name'
    )
    expect(mockAzureStorageBlob.getContainerClient).toHaveBeenNthCalledWith(
      2,
      'container-name'
    )
    expect(mockAzureStorageBlob.exists).toHaveBeenCalledTimes(2)
    expect(mockAzureStorageBlob.getBlockBlobClient).toHaveBeenCalledTimes(2)
    expect(mockAzureStorageBlob.getBlockBlobClient).toHaveBeenNthCalledWith(
      1,
      'testing_proj/example.pdf'
    )
    expect(mockAzureStorageBlob.getBlockBlobClient).toHaveBeenNthCalledWith(
      2,
      'testing_proj/parsed_example.txt'
    )
    expect(mockAzureStorageBlob.download).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.upload).toHaveBeenCalledTimes(1)
    expect(mockAzureStorageBlob.upload).toHaveBeenNthCalledWith(
      1,
      Buffer.from('example text'),
      12
    )

    expect(uploadRequest).not.toBeNull()
    expect(uploadRequest).toContain(
      'Content-Disposition: form-data; name="file"; filename="example.pdf"'
    )
    expect(uploadRequest).toContain('Content-Type: application/octet-stream')
    expect(uploadRequest).toContain('test file content')
    expect(uploadRequest).toContain(
      'Content-Disposition: form-data; name="lang"'
    )
    expect(uploadRequest).toContain('en')
    expect(uploadRequest).toContain(
      'Content-Disposition: form-data; name="parsing_instructions"'
    )
    expect(uploadRequest).toContain('test parsing instructions')
  })
})
