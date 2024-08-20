import multipart from '@fastify/multipart'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { RawServerDefault } from 'fastify'
import { AppModule } from '../../src/app.module'

export async function initTest(): Promise<
  NestFastifyApplication<RawServerDefault>
> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  moduleFixture.useLogger(false)

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter()
  )

  await app.register(multipart)

  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}
