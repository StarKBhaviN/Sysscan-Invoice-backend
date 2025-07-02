import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { RolesGuard } from 'src/roles/roles.guard';
import { AuthGuard } from './auth.guard';
import { jwtConstants } from './constants';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // It runs first as it is up then the RolesGuard will run
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class UsersModule {}
