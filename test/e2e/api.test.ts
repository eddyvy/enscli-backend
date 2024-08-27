import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initTest } from '../helper/api'
import { setEnv } from '../helper/env'

describe('api e2e', () => {
  let app: INestApplication

  beforeAll(() => {
    setEnv()
  })

  beforeEach(async () => {
    app = await initTest()
  })

  it('GET /health should return 200 status up', async () => {
    const res = await request(app.getHttpServer()).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'UP' })
  })
})
