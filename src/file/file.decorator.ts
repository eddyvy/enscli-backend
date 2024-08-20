import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'

export const MultipartUploadedFile = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()

    if (!request.isMultipart())
      throw new BadRequestException('Request is not multipart')

    const file = await request.file()

    if (!file) throw new BadRequestException('No file uploaded')

    return file
  }
)
