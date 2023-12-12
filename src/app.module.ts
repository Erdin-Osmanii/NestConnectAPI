import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PostModule } from './post/post.module';
import { AuthGuard } from './guard/auth/auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { OrganisationModule } from './organisation/organisation.module';

@Module({
  imports: [PostModule, PrismaModule, UserModule, OrganisationModule],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
  exports: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/*');
  }
}
