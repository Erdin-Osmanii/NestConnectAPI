import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UserDto } from './user.dto';
import { Post } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @IsNumber()
  id: number;
  @ApiProperty()
  @IsNumber()
  userId: number;
  @IsOptional()
  user?: UserDto;
  @IsOptional()
  @IsString()
  userName?: string;
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  description: string;

  static mapPostToDto(post: Post): PostDto {
    const mappedPost: PostDto = {
      id: post.id,
      userId: post.authorId,
      title: post.title,
      description: post.content,
    };
    return mappedPost;
  }

  static mapPostWithUserName(post: Post, authorName: string): PostDto {
    const mappedPost: PostDto = {
      id: post.id,
      userId: post.authorId,
      userName: authorName,
      title: post.title,
      description: post.content,
    };
    return mappedPost;
  }
}
