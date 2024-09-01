import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { appFastifyLogger } from './helper/log'

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter()
  fastifyAdapter.register(appFastifyLogger, {
    logger: new Logger().log,
    excludePaths: ['/health'],
  })
  fastifyAdapter.register(cors, {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  )

  await app.register(multipart)

  await app.listen(3000, '0.0.0.0')
}
bootstrap()
