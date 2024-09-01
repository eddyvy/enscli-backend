import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async postAuth(
    @Body('user') user: string,
    @Body('password') password: string
  ) {
    return { authed: !!this.authService.validateUser(user, password) }
  }
}
