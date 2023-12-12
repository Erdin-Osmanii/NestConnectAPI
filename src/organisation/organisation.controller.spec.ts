import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationController } from './organisation.controller';
import { PrismaService } from 'src/prisma.service/prisma.service';
import { UpdateOrganisationDto } from './dto/update.organisation.dto';
import { OrganisationModule } from './organisation.module';

describe('OrganisationController Integration Tests', () => {
  let controller: OrganisationController;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrganisationModule],
    }).compile();

    controller = module.get<OrganisationController>(OrganisationController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('should find an organization by ID', async () => {
    const createdOrganisation = await prismaService.organisation.create({
      data: {
        name: 'Test Organization',
        logoId: 1,
      },
    });

    const foundOrganisation = await controller.findOne(createdOrganisation.id);

    expect(foundOrganisation).toBeDefined();
    expect(foundOrganisation.id).toEqual(createdOrganisation.id);
    expect(foundOrganisation.name).toEqual(createdOrganisation.name);

    await prismaService.organisation.delete({
      where: {
        id: createdOrganisation.id,
      },
    });
  });

  it('should update an organization by ID', async () => {
    const createdOrganisation = await prismaService.organisation.create({
      data: {
        name: 'Test Organization',
        logoId: 1,
      },
    });

    const updateData: UpdateOrganisationDto = {
      name: 'Updated Test Organization',
      logoId: 2,
    };

    const updatedOrganisation = await controller.update(
      createdOrganisation.id,
      updateData,
    );

    const retrievedUpdatedOrganisation =
      await prismaService.organisation.findFirst({
        where: { id: createdOrganisation.id },
      });

    expect(updatedOrganisation).toBeDefined();
    expect(updatedOrganisation.name).toEqual(updateData.name);
    expect(updatedOrganisation.logoId).toEqual(updateData.logoId);

    expect(retrievedUpdatedOrganisation).toBeDefined();
    expect(retrievedUpdatedOrganisation.name).toEqual(updateData.name);
    expect(retrievedUpdatedOrganisation.logoId).toEqual(updateData.logoId);

    await prismaService.organisation.delete({
      where: {
        id: createdOrganisation.id,
      },
    });
  });
});
