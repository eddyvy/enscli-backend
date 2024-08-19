import { BlobServiceClient } from '@azure/storage-blob'
import { Test, TestingModule } from '@nestjs/testing'
import { BlobService } from '../../../src/blob'
import { ConfigModule } from '../../../src/config'
import { setEnv } from '../../helper/env'

jest.mock('@azure/storage-blob')

describe('BlobService', () => {
  let service: BlobService

  const mockFromConnectionString =
    BlobServiceClient.fromConnectionString as unknown as jest.Mock

  const mockUpload = jest.fn()
  const mockGetBlockBlobClient = jest.fn(() => ({ upload: mockUpload }))
  const mockExists = jest.fn()
  const mockGetContainerClient = jest.fn(() => ({
    exists: mockExists,
    getBlockBlobClient: mockGetBlockBlobClient,
  }))
  mockFromConnectionString.mockReturnValue({
    getContainerClient: mockGetContainerClient,
  })

  beforeAll(() => {
    setEnv()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [BlobService],
    }).compile()

    service = module.get<BlobService>(BlobService)
  })

  it('saveBlob works correctly', async () => {
    mockExists.mockResolvedValue(true)

    const content = new Blob(['test'], { type: 'text/plain' })
    const blobPath = 'project/test.txt'

    let error = null
    try {
      await service.saveBlob(content, blobPath)
    } catch (err) {
      error = err
    }

    expect(error).toBeNull()
    expect(mockFromConnectionString).toHaveBeenCalledTimes(1)
    expect(mockFromConnectionString).toHaveBeenNthCalledWith(
      1,
      'connection-string',
    )
    expect(mockGetContainerClient).toHaveBeenCalledTimes(1)
    expect(mockGetContainerClient).toHaveBeenNthCalledWith(1, 'container-name')
    expect(mockExists).toHaveBeenCalledTimes(1)
    expect(mockGetBlockBlobClient).toHaveBeenCalledTimes(1)
    expect(mockGetBlockBlobClient).toHaveBeenNthCalledWith(
      1,
      'project/test.txt',
    )
    expect(mockUpload).toHaveBeenCalledTimes(1)
    expect(mockUpload).toHaveBeenNthCalledWith(1, content, content.size)
  })

  it('saveBlob throws error when container does not exist', async () => {
    mockExists.mockResolvedValue(false)

    const content = new Blob(['test'], { type: 'text/plain' })
    const blobPath = 'project/test.txt'

    let error = null
    try {
      await service.saveBlob(content, blobPath)
    } catch (err) {
      error = err
    }

    expect(error).toEqual(new Error('Azure container does not exist'))
  })
})
