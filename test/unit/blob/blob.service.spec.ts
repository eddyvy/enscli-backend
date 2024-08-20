import { BlobServiceClient } from '@azure/storage-blob'
import { Test, TestingModule } from '@nestjs/testing'
import { BlobService } from '../../../src/blob'
import { ConfigModule } from '../../../src/config'
import { setEnv } from '../../helper/env'

jest.mock('@azure/storage-blob')

describe('BlobService', () => {
  let service: BlobService

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
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [BlobService],
    }).compile()

    service = module.get<BlobService>(BlobService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('saveBlob works correctly', async () => {
    mockContainerClient.exists.mockResolvedValue(true)

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
      'project/test.txt'
    )
    expect(mockBlobClient.upload).toHaveBeenCalledTimes(1)
    expect(mockBlobClient.upload).toHaveBeenNthCalledWith(1, content, 4)
  })

  it('saveBlob works correctly with buffer', async () => {
    mockContainerClient.exists.mockResolvedValue(true)

    const content = Buffer.from('test')
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
      'project/test.txt'
    )
    expect(mockBlobClient.upload).toHaveBeenCalledTimes(1)
    expect(mockBlobClient.upload).toHaveBeenNthCalledWith(1, content, 4)
  })

  it('saveBlob throws error when container does not exist', async () => {
    mockContainerClient.exists.mockResolvedValue(false)

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

  it('getBlob works correctly', async () => {
    const testBlob = new Blob(['test'], { type: 'text/plain' })

    mockContainerClient.exists.mockResolvedValue(true)
    mockBlobClient.download.mockResolvedValue({ blobBody: testBlob })

    const result = await service.getBlob('project/test.txt')

    expect(result).toEqual(testBlob)

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
      'project/test.txt'
    )
    expect(mockBlobClient.download).toHaveBeenCalledTimes(1)
  })

  it('getBlob throws error when container does not exist', async () => {
    mockContainerClient.exists.mockResolvedValue(false)

    const blobPath = 'project/test.txt'

    let error = null
    try {
      await service.getBlob(blobPath)
    } catch (err) {
      error = err
    }

    expect(error).toEqual(new Error('Azure container does not exist'))
  })
})
