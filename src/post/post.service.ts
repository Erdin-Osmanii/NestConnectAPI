import {
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { AddPostDto } from 'src/dto/addPost.dto';
import { PostDto } from 'src/dto/post.dto';
import { updatePostDto } from 'src/dto/updatePost.dto';
import { UserDto } from 'src/dto/user.dto';
import { Roles } from 'src/enum/roles.enum/roles.enum';
import { PrismaService } from 'src/prisma.service/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPostById(id: number) {
    const foundPost = await this.prisma.post.findFirst({
      where: { id: id },
      include: { author: true },
    });

    if (!foundPost) throw new NotFoundException('Post not found');
    const postToReturn = PostDto.mapPostWithUserName(
      foundPost,
      foundPost?.author.name,
    );
    return postToReturn;
  }

  async getPosts() {
    const foundPosts = await this.prisma.post.findMany();
    const allPosts: PostDto[] = foundPosts.map((post) => {
      return PostDto.mapPostToDto(post);
    });
    return allPosts;
  }

  async addPost(newPost: AddPostDto, user: UserDto) {
    await this.prisma.post.create({
      data: {
        title: newPost.title,
        content: newPost.description,
        authorId: user.id,
      },
    });
  }

  async updatePost(id: number, newPost: updatePostDto, userId: number) {
    const postToUpdate = await this.prisma.post.findFirst({
      where: { id: id },
    });
    if (!postToUpdate) {
      throw new NotFoundException('Post not found');
    }

    if (postToUpdate.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    }

    if (newPost.title && newPost.description) {
      const updatedPost = await this.prisma.post.update({
        where: { id: id },
        data: { title: newPost.title, content: newPost.description },
      });
      return PostDto.mapPostToDto(updatedPost);
    }
    if (newPost.title) {
      const updatedPost = await this.prisma.post.update({
        where: { id: id },
        data: { title: newPost.title },
      });
      return PostDto.mapPostToDto(updatedPost);
    }
    if (newPost.description) {
      const updatedPost = await this.prisma.post.update({
        where: { id: id },
        data: { content: newPost.description },
      });
      return PostDto.mapPostToDto(updatedPost);
    }

    return PostDto.mapPostToDto(postToUpdate);
  }

  async deletePost(id: number, userRole: Roles, userId: number) {
    const postToDelete = await this.prisma.post.findFirst({
      where: { id: id },
    });

    if (!postToDelete) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== Roles.Admin && postToDelete.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this post',
      );
    }

    await this.prisma.post.delete({ where: { id: id } });
  }
}
