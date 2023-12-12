/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/prisma.service/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');

    const userId = parseInt(decodedToken, 10);
    if (isNaN(userId) || userId === undefined) {
      throw new UnauthorizedException('Invalid user ID in the token');
    }
    const foundUser = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    const user = UserDto.mapUserToDto(foundUser);
    req['user'] = user;
    next();
  }
}
