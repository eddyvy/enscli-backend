import { IsNotEmpty, IsString } from 'class-validator'

export class ClinicalProtocolEmbedDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  getFileExtension() {
    return this.filename.split('.').at(-1)
  }
}
