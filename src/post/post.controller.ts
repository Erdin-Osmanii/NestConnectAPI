import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { updatePostDto } from 'src/dto/updatePost.dto';
import { Roles } from 'src/enum/roles.enum/roles.enum';
import { GetUser } from 'src/decorator/user.decorator';
import { UserDto } from 'src/dto/user.dto';
import { Role } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles/roles.guard';
import { AuthGuard } from 'src/guard/auth/auth.guard';
import { AddPostDto } from 'src/dto/addPost.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiSecurity('basic')
@ApiTags('posts')
@UseGuards(AuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('posts/:id')
  getPostById(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    const post = this.postService.getPostById(id);
    return post;
  }

  @Get('/posts')
  getPosts() {
    return this.postService.getPosts();
  }

  @Post('/posts')
  addPost(@Body() newPost: AddPostDto, @GetUser() user: UserDto) {
    this.postService.addPost(newPost, user);
  }

  @Patch('/posts/:id')
  updatePost(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() newPost: updatePostDto,
    @GetUser() user: UserDto,
  ) {
    const updatedPost = this.postService.updatePost(id, newPost, user.id);
    return updatedPost;
  }

  @Delete('posts/:id')
  @UseGuards(RolesGuard)
  @Role(Roles.Admin, Roles.Member)
  async deletePost(
    @Param('id', new ParseIntPipe()) id: number,
    @GetUser() user: UserDto,
  ) {
    await this.postService.deletePost(id, user.role, user.id);
  }
}
