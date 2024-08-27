import { IsNotEmpty, IsString } from 'class-validator'

export class ClinicalProtocolChunkDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  getFileExtension() {
    return this.filename.split('.').at(-1)
  }
}
