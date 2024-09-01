import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common'
import { AxiosError } from 'axios'

@Catch(AxiosError)
export class AiManagerFilter implements ExceptionFilter {
  catch(exception: AxiosError<any>, _: ArgumentsHost) {
    if (exception?.response?.data?.detail)
      throw new InternalServerErrorException(exception.response.data.detail)

    throw exception
  }
}
