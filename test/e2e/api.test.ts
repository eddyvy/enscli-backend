import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { setEnv } from '../helper/env'

describe('api e2e', () => {
  let app: INestApplication

  beforeAll(() => {
    setEnv()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('GET /health should return 200 status up', async () => {
    const res = await request(app.getHttpServer()).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'UP' })
  })
})
