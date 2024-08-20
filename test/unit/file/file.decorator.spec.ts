import { BadRequestException } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { MultipartUploadedFile } from '../../../src/file'
import { testGetParamDecoratorFactory } from '../../helper/decorator'

describe('MultipartUploadedFile', () => {
  const mockRequest = {
    isMultipart: jest.fn(),
    file: jest.fn(),
  }
  const mockGetRequest = jest.fn(() => mockRequest)
  const mockCtx = {
    switchToHttp: jest.fn(() => ({ getRequest: mockGetRequest })),
  }

  it('should return the uploaded file', async () => {
    mockRequest.isMultipart.mockReturnValueOnce(true)
    mockRequest.file.mockReturnValueOnce('uploaded-file')

    const result = await testGetParamDecoratorFactory(MultipartUploadedFile)(
      null,
      mockCtx
    )

    expect(result).toBe('uploaded-file')
  })

  it('should throw BadRequestException if request is not multipart', async () => {
    mockRequest.isMultipart.mockReturnValueOnce(false)

    let result = null
    let error = null
    try {
      result = await testGetParamDecoratorFactory(MultipartUploadedFile)(
        null,
        mockCtx
      )
    } catch (e) {
      error = e
    }

    expect(result).toBeNull()
    expect(error).toEqual(new BadRequestException('Request is not multipart'))
  })

  it('should throw BadRequestException if no file is uploaded', async () => {
    mockRequest.isMultipart.mockReturnValueOnce(true)
    mockRequest.file.mockReturnValueOnce(null)

    let result = null
    let error = null
    try {
      result = await testGetParamDecoratorFactory(MultipartUploadedFile)(
        null,
        mockCtx
      )
    } catch (e) {
      error = e
    }

    expect(result).toBeNull()
    expect(error).toEqual(new BadRequestException('No file uploaded'))
  })
})
