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

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  )

  await app.register(multipart)

  await app.listen(3000)
}
bootstrap()
