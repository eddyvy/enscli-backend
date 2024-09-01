import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ClinicalProtocolChatDto {
  @IsString()
  @IsNotEmpty()
  message: string

  @IsString()
  @IsOptional()
  sessionId?: string
}
