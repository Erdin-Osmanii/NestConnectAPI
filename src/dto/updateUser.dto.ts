/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  name?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;
}
