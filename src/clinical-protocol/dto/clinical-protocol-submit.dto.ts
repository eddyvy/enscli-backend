import { IsNotEmpty, IsString } from 'class-validator'

export class ClinicalProtocolSubmitDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsNotEmpty()
  content: string

  getFileExtension() {
    return this.filename.split('.').at(-1)
  }
}
