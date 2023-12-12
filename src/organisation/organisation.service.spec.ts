import { PrismaService } from 'src/prisma.service/prisma.service';
import { OrganisationService } from './organisation.service';
import { OrganisationDto } from './dto/organisation.dto';
import { OrganisationListDto } from './dto/organisation.list.dto';
import { UserDto } from 'src/dto/user.dto';
import { UpdateOrganisationDto } from './dto/update.organisation.dto';
import * as fs from 'fs/promises';
import { Test, TestingModule } from '@nestjs/testing';

describe('OrganisationService', () => {
  let organisationService: OrganisationService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationService,
        {
          provide: PrismaService,
          useValue: {
            organisation: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    organisationService = module.get<OrganisationService>(OrganisationService);
    prismaServiceMock = module.get<PrismaService>(PrismaService);
  });

  it('should create an organisation', async () => {
    const organisationDto: OrganisationDto = {
      name: 'Test Organisation',
      logoId: 1,
    };

    (prismaServiceMock.organisation.create as jest.Mock).mockResolvedValueOnce({
      name: organisationDto.name,
      logoId: organisationDto.logoId,
    });

    await organisationService.create(organisationDto);

    expect(prismaServiceMock.organisation.create).toHaveBeenCalledWith({
      data: {
        name: organisationDto.name,
        logoId: organisationDto.logoId,
      },
    });
  });

  it('should find all organisations without filters', async () => {
    const mockOrganisations = [];

    const mapToOrganisationListDtoSpy = jest.spyOn(
      OrganisationListDto,
      'mapToOrganisationListDto',
    );

    (
      prismaServiceMock.organisation.findMany as jest.Mock
    ).mockResolvedValueOnce(mockOrganisations);

    const result = await organisationService.findAll();

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledWith({
      include: { _count: { select: { employees: true } } },
    });

    expect(mapToOrganisationListDtoSpy).toHaveBeenCalledTimes(
      mockOrganisations.length,
    );

    expect(result).toEqual(mockOrganisations);
  });

  it('should find organisations with provided name filter', async () => {
    const mockOrganisations = [];

    const mapToOrganisationListDtoSpy = jest.spyOn(
      OrganisationListDto,
      'mapToOrganisationListDto',
    );

    (
      prismaServiceMock.organisation.findMany as jest.Mock
    ).mockResolvedValueOnce(mockOrganisations);

    const result = await organisationService.findAll({ name: 'TestName' });

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledWith({
      where: { name: { startsWith: 'TestName' } },
      include: { _count: { select: { employees: true } } },
    });

    expect(mapToOrganisationListDtoSpy).toHaveBeenCalledTimes(
      mockOrganisations.length,
    );

    expect(result).toEqual(mockOrganisations);
  });

  it('should find one organisation by ID', async () => {
    const mockOrganisation = {
      id: 1,
      employees: [],
    };

    const mockUserDto = {} as UserDto;
    const mapUserToDtoSpy = jest
      .spyOn(UserDto, 'mapUserToDto')
      .mockReturnValue(mockUserDto);

    const mockOrganisationDto = {} as OrganisationDto;
    const mapToOrganisationDtoSpy = jest
      .spyOn(OrganisationDto, 'mapToOrganisationDto')
      .mockReturnValue(mockOrganisationDto);

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(mockOrganisation);

    const result = await organisationService.findOne(1);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { employees: true },
    });

    expect(mapToOrganisationDtoSpy).toHaveBeenCalledWith(
      mockOrganisation,
      expect.any(Array),
    );

    expect(mapUserToDtoSpy).toHaveBeenCalledTimes(
      mockOrganisation.employees.length,
    );

    expect(result).toEqual(mockOrganisationDto);
  });

  it('should update an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
      name: 'ExistingName',
      logoId: 1,
    };

    const updateDto: UpdateOrganisationDto = {
      name: 'UpdatedName',
      logoId: 2,
    };

    const updatedOrganisation = OrganisationDto.mapToOrganisationDto({
      ...existingOrganisation,
      ...updateDto,
    });

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    (prismaServiceMock.organisation.update as jest.Mock).mockResolvedValueOnce({
      ...existingOrganisation,
      ...updateDto,
    });

    const result = await organisationService.update(1, updateDto);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: updateDto,
    });

    expect(result).toEqual(updatedOrganisation);
  });

  it('should remove an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
    };

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    await organisationService.remove(1);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaServiceMock.organisation.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should find employees of an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
      employees: [],
    };

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    const mockUserDto = {} as UserDto;
    const mapUserToDtoSpy = jest
      .spyOn(UserDto, 'mapUserToDto')
      .mockReturnValue(mockUserDto);

    await organisationService.findEmployees(1);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { employees: true },
    });

    expect(mapUserToDtoSpy).toHaveBeenCalledTimes(
      existingOrganisation.employees.length,
    );
  });

  it('should add an employee to an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
    };

    const existingUser = {
      id: 100,
    };

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    (prismaServiceMock.user.findFirst as jest.Mock).mockResolvedValueOnce(
      existingUser,
    );

    await organisationService.addEmployee(1, 100);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaServiceMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 100 },
    });

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { employees: { connect: { id: 100 } } },
    });
  });

  it('should delete an employee from an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
      employees: [{ id: 100 }],
    };

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    await organisationService.deleteEmployee(1, 100);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { employees: { where: { id: 100 } } },
    });

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { employees: { disconnect: { id: 100 } } },
    });
  });

  it('should upload logo for an existing organisation', async () => {
    const existingOrganisation = {
      id: 1,
      logoId: null,
    };

    const logoFile = {
      buffer: Buffer.from('mockLogoContent'),
    };

    (
      prismaServiceMock.organisation.findFirst as jest.Mock
    ).mockResolvedValueOnce(existingOrganisation);

    (prismaServiceMock.organisation.update as jest.Mock).mockResolvedValueOnce({
      ...existingOrganisation,
      logoId: 123,
    });

    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValueOnce();

    await organisationService.uploadLogo(logoFile as any, 1);

    expect(prismaServiceMock.organisation.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { logoId: expect.any(Number) },
    });

    expect(writeFileSpy).toHaveBeenCalled();
  });
});
