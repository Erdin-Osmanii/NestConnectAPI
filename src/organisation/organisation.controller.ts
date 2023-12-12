import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { UpdateOrganisationDto } from './dto/update.organisation.dto';
import { AuthGuard } from 'src/guard/auth/auth.guard';
import { RolesGuard } from 'src/guard/roles/roles.guard';
import { Role } from 'src/decorator/roles.decorator';
import { Roles } from 'src/enum/roles.enum/roles.enum';
import { OrganisationDto } from './dto/organisation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('organisations')
@ApiSecurity('basic')
@ApiTags('organisations')
@UseGuards(AuthGuard)
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @Post()
  create(@Body() OrganisationDto: OrganisationDto) {
    return this.organisationService.create(OrganisationDto);
  }

  @Get()
  findAll(@Query('') filters?: any) {
    return this.organisationService.findAll(filters);
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.organisationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.Admin)
  update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
  ) {
    return this.organisationService.update(id, updateOrganisationDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.Admin)
  remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.organisationService.remove(id);
  }

  @Get(':id/employees')
  findEmployees(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.organisationService.findEmployees(id);
  }

  @Post(':id/employees')
  @UseGuards(RolesGuard)
  @Role(Roles.Admin)
  addEmployee(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    organisationId: number,
    @Query(
      'userId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    employeeId: number,
  ) {
    return this.organisationService.addEmployee(organisationId, employeeId);
  }

  @Delete(':id/employees/:userId')
  @UseGuards(RolesGuard)
  @Role(Roles.Admin)
  deleteEmployee(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    organisationId: number,
    @Param(
      'userId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    employeeId: number,
  ) {
    return this.organisationService.deleteEmployee(organisationId, employeeId);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    logo: Express.Multer.File,
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.organisationService.uploadLogo(logo, id);
  }
}
