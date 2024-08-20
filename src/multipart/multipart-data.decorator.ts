import { MultipartFile } from '@fastify/multipart'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'

export const MultipartData = createParamDecorator(
  async (_: string | null, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>()
    return req['multipart_data'] as MultipartFile
  }
)
