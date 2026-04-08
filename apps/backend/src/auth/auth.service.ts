import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, Role } from '@njiani/shared';
import { UserEntity } from '../common/entities';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (user && (await bcrypt.compare(loginDto.password, user.passwordHash))) {
      const { passwordHash, ...safeUser } = user;
      return new UserEntity({
        ...safeUser,
        role: safeUser.role as unknown as Role,
      });
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
