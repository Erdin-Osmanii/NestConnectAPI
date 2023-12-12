import { PartialType } from '@nestjs/mapped-types';
import { OrganisationDto } from './organisation.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganisationDto extends PartialType(OrganisationDto) {
  @IsOptional()
  @IsString()
  @ApiProperty()
  name: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  logoId?: number;
}
