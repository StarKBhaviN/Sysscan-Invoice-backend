import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { createUserDTO } from './dtos/create-user-dto';
import { LoginDTO } from './dtos/login-dto';
import { SignUpResponse } from './User';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signup(payload: createUserDTO): Promise<SignUpResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User Already Exists.', {
        cause: new Error(),
        description: 'This user email is already there in database.',
      });
    }
    // Save the user password in encrypted format- bcryptJS
    const hash = await this.encryptPassword(payload.password, 10);
    payload.password = hash;

    // Save the user in DB : Use prisma methods refer doc : without return it will show error
    return this.prisma.user.create({
      data: payload,
      select: {
        email: true,
        id: true,
      },
    });
  }

  async login(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    // Find user based on Email
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDTO.email,
      },
    });
    // If there is no user then unautorized
    if (!user) {
      throw new UnauthorizedException();
    }
    // Decrypt user password and match with provided body password with decrypted pass
    const isMatched = await this.decryptPassword(
      loginDTO.password,
      user.password,
    );

    if (!isMatched) {
      throw new UnauthorizedException('Invalid Creds');
    }
    // If not match then invalid creds
    // return json web token : Help user to authenticate protected routes
    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        role: user.role,
      },
      {
        expiresIn: '1d',
      },
    );

    return { accessToken };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        Subscription: true,
        Company: true,
        Payment: true,
      },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        Subscription: true,
        Company: true,
        Payment: true,
      },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async encryptPassword(plainText: string, saltRound: number) {
    return await bcrypt.hash(plainText, saltRound);
  }

  async decryptPassword(plainText: string, hash: string) {
    return await bcrypt.compare(plainText, hash);
  }
}
