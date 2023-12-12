/* eslint-disable prettier/prettier */

import { Roles } from 'src/enum/roles.enum/roles.enum';
import { PostDto } from './post.dto';
import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ enum: Roles })
  role: Roles;
  posts?: PostDto[];

  static mapUserToDto(user: User): UserDto {
    const mappedUser: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Roles,
    };
    return mappedUser;
  }
}
