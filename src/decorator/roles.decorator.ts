import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/enum/roles.enum/roles.enum';

export const Role = (...roles: Roles[]) => SetMetadata('roles', roles);
