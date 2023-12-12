/* eslint-disable prettier/prettier */
import { UserDto } from 'src/dto/user.dto';
import { Roles } from 'src/enum/roles.enum/roles.enum';

export const users: UserDto[] = [
  {
    id: 1,
    name: 'First User',
    email: 'firstuser@email.com',
    role: Roles.Admin,
  },
  {
    id: 2,
    name: 'Second User',
    email: 'seconduser@gmail.com',
    role: Roles.Member,
  },
  {
    id: 3,
    name: 'Third user',
    email: 'thirduser@gmail.com',
    role: Roles.Member,
  },
];
