import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from '@prisma/client';

export class OrganisationListDto {
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  logoId?: number;
  employeesNumber?: number;

  static mapToOrganisationListDto(
    organisation: Organisation,
  ): OrganisationListDto {
    const mappedOrganisation: OrganisationListDto = {
      id: organisation.id,
      name: organisation.name,
      logoId: organisation.logoId,
    };

    return mappedOrganisation;
  }
}
