import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from '@prisma/client';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UserDto } from 'src/dto/user.dto';

export class OrganisationDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  logoId?: number;
  @IsOptional()
  employees?: UserDto[];

  static mapToOrganisationDto(
    organisation: Organisation,
    employees?: UserDto[],
  ): OrganisationDto {
    const mappedOrganisation: OrganisationDto = {
      id: organisation.id,
      name: organisation.name,
      logoId: organisation.logoId,
    };

    if (employees) {
      mappedOrganisation.employees = employees;
    }
    return mappedOrganisation;
  }
}
