import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '../entities';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed
    return super.canActivate(context);
  }

  handleRequest<TUser = UserEntity>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      if (err) {
        throw err;
      }
      throw new UnauthorizedException();
    }
    return user;
  }
}
