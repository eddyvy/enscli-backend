import { Readable } from 'stream'

export class MockReadableStream extends Readable {
  private data: Buffer[]
  private index: number

  constructor(data: Buffer[]) {
    super()
    this.data = data
    this.index = 0
  }

  _read() {
    if (this.index < this.data.length) {
      this.push(this.data[this.index])
      this.index++
    } else {
      this.push(null) // No more data
    }
  }
}

const testFile = Buffer.from('test file content')

const mockExists = jest.fn()
const mockUpload = jest.fn()
const mockDownload = jest.fn(() => ({
  readableStreamBody: new MockReadableStream([testFile]),
}))
const mockGetBlockBlobClient = jest.fn(() => ({
  download: mockDownload,
  upload: mockUpload,
}))
const mockGetContainerClient = jest.fn(() => ({
  exists: mockExists,
  getBlockBlobClient: mockGetBlockBlobClient,
}))
const mockFromConnectionString = jest.fn(() => ({
  getContainerClient: mockGetContainerClient,
}))

export const mockAzureStorageBlob = {
  downloadedFile: testFile,
  exists: mockExists,
  upload: mockUpload,
  download: mockDownload,
  getBlockBlobClient: mockGetBlockBlobClient,
  getContainerClient: mockGetContainerClient,
  fromConnectionString: mockFromConnectionString,
}
