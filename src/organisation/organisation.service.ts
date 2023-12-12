import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganisationDto } from './dto/organisation.dto';
import { UpdateOrganisationDto } from './dto/update.organisation.dto';
import { PrismaService } from 'src/prisma.service/prisma.service';
import { UserDto } from 'src/dto/user.dto';
import { OrganisationListDto } from './dto/organisation.list.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';

@Injectable()
export class OrganisationService {
  constructor(private prisma: PrismaService) {}
  async create(OrganisationDto: OrganisationDto) {
    await this.prisma.organisation.create({
      data: {
        name: OrganisationDto.name,
        logoId: OrganisationDto.logoId,
      },
    });
  }

  async findAll(filters?: any) {
    let organisations;
    if (filters && filters.name) {
      organisations = await this.prisma.organisation.findMany({
        where: { name: { startsWith: filters.name } },
        include: { _count: { select: { employees: true } } },
      });
    } else {
      organisations = await this.prisma.organisation.findMany({
        include: { _count: { select: { employees: true } } },
      });
    }

    const allOrganisations = organisations.map((organisation) => {
      const mappedOrganisation =
        OrganisationListDto.mapToOrganisationListDto(organisation);
      mappedOrganisation.employeesNumber = organisation?._count.employees;
      return mappedOrganisation;
    });

    return allOrganisations;
  }

  async findOne(id: number) {
    const organisation = await this.prisma.organisation.findFirst({
      where: { id: id },
      include: { employees: true },
    });
    const users = organisation.employees.map((employee) => {
      return UserDto.mapUserToDto(employee);
    });

    const mappedOrganisation = OrganisationDto.mapToOrganisationDto(
      organisation,
      users,
    );

    return mappedOrganisation;
  }

  async update(id: number, updateOrganisationDto: UpdateOrganisationDto) {
    const organisationToUpdate = await this.prisma.organisation.findFirst({
      where: { id: id },
    });

    if (!organisationToUpdate) {
      throw new NotFoundException('Organisation not found');
    }

    if (updateOrganisationDto.name) {
      organisationToUpdate.name = updateOrganisationDto.name;
    }

    if (updateOrganisationDto.logoId) {
      organisationToUpdate.logoId = updateOrganisationDto.logoId;
    }

    const updatedOrganisation = await this.prisma.organisation.update({
      where: { id: id },
      data: {
        name: updateOrganisationDto.name,
        logoId: updateOrganisationDto.logoId,
      },
    });

    return OrganisationDto.mapToOrganisationDto(updatedOrganisation);
  }

  async remove(id: number) {
    const organisationToDelete = await this.prisma.organisation.findFirst({
      where: { id: id },
    });

    if (!organisationToDelete) {
      throw new NotFoundException('Organisation not found');
    }

    await this.prisma.organisation.delete({ where: { id: id } });
  }
  async findEmployees(id: number) {
    const organisation = await this.prisma.organisation.findFirst({
      where: { id: id },
      include: { employees: true },
    });

    if (!organisation) {
      return new NotFoundException('Organisation not found');
    }

    const employees = organisation.employees.map((employee) => {
      return UserDto.mapUserToDto(employee);
    });

    return employees;
  }

  async addEmployee(organisationId: number, employeeId: number) {
    const organisation = await this.prisma.organisation.findFirst({
      where: { id: organisationId },
    });

    if (!organisation) {
      return new NotFoundException('Organisation not found');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: employeeId },
    });
    if (!user) {
      return new NotFoundException('User not found');
    }

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: { employees: { connect: { id: employeeId } } },
    });
  }

  async deleteEmployee(organisationId: number, employeeId: number) {
    const organisation = await this.prisma.organisation.findFirst({
      where: { id: organisationId },
      include: { employees: { where: { id: employeeId } } },
    });

    if (!organisation) {
      return new NotFoundException('Organisation not found');
    }

    const employeeExists = organisation.employees.some(
      (emp) => emp.id === employeeId,
    );

    if (!employeeExists) {
      return new NotFoundException('Employee not found');
    }

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: { employees: { disconnect: { id: employeeId } } },
    });
  }

  async uploadLogo(logo: Express.Multer.File, id: number) {
    const organisation = await this.prisma.organisation.findFirst({
      where: { id: id },
    });

    if (!organisation) {
      return new NotFoundException('Organisation not found');
    }

    if (!organisation.logoId) {
      const uuid = uuidv4();
      const hash = uuid.split('-').join('').substring(0, 4);
      const autoId = parseInt(hash, 16);

      await this.prisma.organisation.update({
        where: { id },
        data: { logoId: autoId },
      });
    }

    const fileName = `logo${organisation.logoId}.jpeg`;
    const filePath = `src/logoUploads/${fileName}`;

    await fs.writeFile(filePath, logo.buffer);
  }
}
