import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class updatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  title?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
