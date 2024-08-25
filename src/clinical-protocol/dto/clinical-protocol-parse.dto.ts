import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ClinicalProtocolParseDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsOptional()
  lang?: string

  @IsString()
  @IsOptional()
  parsing_instructions?: string

  getFileExtension() {
    return this.filename.split('.').at(-1)
  }

  getFileNameWithTxtExtension() {
    return this.filename.replace(/\.[^/.]+$/, '.txt')
  }
}
