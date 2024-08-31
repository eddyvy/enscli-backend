import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ClinicalProtocolEmbedDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsOptional()
  model?: string

  getFileExtension() {
    return this.filename.split('.').at(-1)
  }
}
