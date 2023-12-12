import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostDto } from 'src/dto/post.dto';
import { UpdateUserDto } from 'src/dto/updateUser.dto';
import { UserDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/prisma.service/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getUserById(id: number): Promise<UserDto> {
    const foundUser = await this.prisma.user.findFirst({
      where: { id: id },
      include: { posts: true },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    const userToReturn = UserDto.mapUserToDto(foundUser);

    const posts: PostDto[] = foundUser?.posts.map((post) => {
      return PostDto.mapPostToDto(post);
    });
    userToReturn.posts = posts;

    return userToReturn;
  }

  async getUsers(): Promise<UserDto[]> {
    const foundUsers = await this.prisma.user.findMany();
    const allUsers: UserDto[] = foundUsers.map((user) => {
      return UserDto.mapUserToDto(user);
    });
    return allUsers;
  }

  async updateUser(
    id: number,
    newUser: UpdateUserDto,
    userId: number,
  ): Promise<UserDto> {
    const userToUpdate = await this.prisma.user.findFirst({
      where: { id: id },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    if (newUser.name) {
      userToUpdate.name = newUser.name;
    }
    if (newUser.email) {
      userToUpdate.email = newUser.email;
    }

    await this.prisma.user.update({
      where: { id: id },
      data: {
        name: userToUpdate.name,
        email: userToUpdate.email,
      },
    });

    const userToReturn: UserDto = UserDto.mapUserToDto(userToUpdate);

    return userToReturn;
  }

  async deleteUser(id: number, userId: number) {
    const userToUpdate = await this.prisma.user.findFirst({
      where: { id: id },
    });
    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this user',
      );
    }
    await this.prisma.user.delete({ where: { id: id } });
  }
}
