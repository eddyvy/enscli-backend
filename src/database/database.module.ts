import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Global()
@Module({
  imports: [HttpModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
