import { HttpModule } from '@nestjs/axios'
import { InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import nock from 'nock'
import { ConfigModule } from '../../../src/config'
import { sleep } from '../../../src/helper/time'
import { ParserService } from '../../../src/parser'
import { setEnv } from '../../helper/env'

jest.mock('../../../src/helper/time')

describe('ParserService', () => {
  let service: ParserService

  beforeAll(() => {
    setEnv()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      providers: [ParserService],
    }).compile()

    service = module.get<ParserService>(ParserService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('parseBinaryToText works correctly', async () => {
    let result = null
    let error = null
    let postReqBody = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, (_, body) => {
        postReqBody = body
        return { id: 'abc-def-ghi', status: 'PENDING' }
      })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .reply(200, { id: 'abc-def-ghi', status: 'SUCCESS' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi/result/raw/text')
      .reply(200, 'example text')

    try {
      result = await service.parseBinaryToText(
        file,
        'example.pdf',
        'en',
        'Some instructions for AI'
      )
    } catch (err) {
      error = err
    }

    expect(error).toBeNull()
    expect(result).toEqual('example text')

    expect(postReqBody).not.toBeNull()
    expect(postReqBody).toContain(
      'Content-Disposition: form-data; name="file"; filename="example.pdf"'
    )
    expect(postReqBody).toContain('Content-Type: application/json')
    expect(postReqBody).toContain('example file')
    expect(postReqBody).toContain('Content-Disposition: form-data; name="lang"')
    expect(postReqBody).toContain('en')
    expect(postReqBody).toContain(
      'Content-Disposition: form-data; name="parsing_instructions"'
    )
    expect(postReqBody).toContain('Some instructions for AI')

    expect(sleep).toHaveBeenCalledTimes(1)
    expect(sleep).toHaveBeenNthCalledWith(1, 2000)
  })

  it('parseBinaryToText works correctly with some pending calls', async () => {
    let result = null
    let error = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

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

    try {
      result = await service.parseBinaryToText(file, 'example.pdf')
    } catch (err) {
      error = err
    }

    expect(error).toBeNull()
    expect(result).toEqual('example text')
    expect(sleep).toHaveBeenCalledTimes(4)
  })

  it('parseBinaryToText throws error when upload fails', async () => {
    let result = null
    let error = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, { error: 'Some error' })

    try {
      result = await service.parseBinaryToText(file, 'example.pdf')
    } catch (err) {
      error = err
    }

    expect(result).toBeNull()
    expect(error).toEqual(
      new InternalServerErrorException(
        'Llama Cloud Error. Parsing job. Fail to upload'
      )
    )
  })

  it('parseBinaryToText throws timeou error when infinite pending', async () => {
    let result = null
    let error = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .times(100)
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    try {
      result = await service.parseBinaryToText(file, 'example.pdf')
    } catch (err) {
      error = err
    }

    expect(result).toBeNull()
    expect(error).toEqual(
      new InternalServerErrorException(
        'Llama Cloud Error. Parsing job. Pending timeout'
      )
    )
    expect(sleep).toHaveBeenCalledTimes(60)
  })

  it('parseBinaryToText throws error when status ERROR', async () => {
    let result = null
    let error = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .times(3)
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .reply(200, { id: 'abc-def-ghi', status: 'ERROR' })

    try {
      result = await service.parseBinaryToText(file, 'example.pdf')
    } catch (err) {
      error = err
    }

    expect(result).toBeNull()
    expect(error).toEqual(
      new InternalServerErrorException(
        'Llama Cloud Error. Parsing job. Status: ERROR'
      )
    )
    expect(sleep).toHaveBeenCalledTimes(4)
  })

  it('parseBinaryToText throws error when download fails', async () => {
    let result = null
    let error = null

    const file = new Blob(['example file'], { type: 'application/json' })

    nock('http://api.url')
      .post('/parsing/upload')
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .times(3)
      .reply(200, { id: 'abc-def-ghi', status: 'PENDING' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi')
      .reply(200, { id: 'abc-def-ghi', status: 'SUCCESS' })

    nock('http://api.url')
      .get('/parsing/job/abc-def-ghi/result/raw/text')
      .reply(200, { error: 'Some error' })

    try {
      result = await service.parseBinaryToText(file, 'example.pdf')
    } catch (err) {
      error = err
    }

    expect(result).toBeNull()
    expect(error).toEqual(
      new InternalServerErrorException(
        'Llama Cloud Error. Parsing job. Fail to download'
      )
    )
    expect(sleep).toHaveBeenCalledTimes(4)
  })
})
