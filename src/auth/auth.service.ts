import { Injectable } from '@nestjs/common'
import { ConfigService } from '../config'

@Injectable()
export class AuthService {
  private readonly appUsers: string[]
  private readonly appPassword: string

  constructor(config: ConfigService) {
    this.appUsers = config.AUTH.USERS.split(',')
    this.appPassword = config.AUTH.PASSWORD
  }

  validateUser(username: string, password: string): string {
    if (this.appUsers.includes(username) && password === this.appPassword)
      return username

    return null
  }
}
