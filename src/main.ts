import multipart from '@fastify/multipart'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter()

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  )

  await app.register(multipart)

  await app.listen(3000)
}
bootstrap()
