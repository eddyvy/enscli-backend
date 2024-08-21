import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const authorizationHeader = request.headers.authorization

    if (!authorizationHeader || !authorizationHeader.startsWith('Basic '))
      throw new UnauthorizedException()

    const base64Credentials = authorizationHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    )
    const [username, password] = credentials.split(':')
    if (!username || !password) throw new UnauthorizedException()

    const user = this.authService.validateUser(username, password)
    if (!user) throw new UnauthorizedException()

    request['user'] = user
    return true
  }
}
