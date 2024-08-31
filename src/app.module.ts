import { Module, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClinicalProtocolModule } from './clinical-protocol'
import { ConfigModule } from './config'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [ConfigModule, AuthModule, DatabaseModule, ClinicalProtocolModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
