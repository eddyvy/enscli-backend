import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { Observable } from 'rxjs'

@Injectable()
export class MultipartInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<FastifyRequest>()
    if (!req.isMultipart())
      throw new BadRequestException('multipart/form-data is required')

    const multipartData = await req.file()
    if (!multipartData) throw new BadRequestException('file exected')

    req['multipart_data'] = multipartData

    return next.handle()
  }
}
