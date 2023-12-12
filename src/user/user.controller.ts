import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from 'src/dto/updateUser.dto';
import { UserDto } from 'src/dto/user.dto';
import { GetUser } from 'src/decorator/user.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiSecurity('basic')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Get('users/:id')
  getUserById(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    const user = this.userService.getUserById(id);
    return user;
  }

  @Get('/users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Patch('users/:id')
  updateUser(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() newUser: UpdateUserDto,
    @GetUser() user: UserDto,
  ): Promise<UserDto> {
    const updatedUser = this.userService.updateUser(id, newUser, user.id);
    return updatedUser;
  }

  @Delete('users/:id')
  async deleteUser(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetUser() user: UserDto,
  ) {
    await this.userService.deleteUser(id, user.id);
  }

  @Get('/profile')
  getProfile(@GetUser() user: UserDto) {
    return user;
  }
}
