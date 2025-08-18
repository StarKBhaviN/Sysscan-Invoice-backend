import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/roles/roles.enum';
import { AdminCreateUserDTO } from './dtos/admin-create-user.dto';
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
      data: {
        email: payload.email,
        password: payload.password,
        username: payload.username,
        profileImage: payload.profileImage,
        phoneNumber: payload.phoneNumber,
        adminRefID: payload.adminRefID ?? undefined,
        role: (payload.role as any) ?? 'USER',
      },
      select: { email: true, id: true },
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
      throw new UnauthorizedException('Invalid Creds');
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

  async issueFreshToken(userId: number): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
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

  async getSubUsersForAdmin(adminId: number) {
    return this.prisma.user.findMany({
      where: { adminRefID: adminId },
    });
  }

  async addSubUserForAdmin(adminId: number, dto: AdminCreateUserDTO) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { Subscription: true },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    if (![Role.Admin, Role.Owner].includes(admin.role as unknown as Role)) {
      throw new UnauthorizedException('Only admins can add users');
    }
    const activeSubscription = await this.prisma.subscription.findUnique({
      where: { userID: adminId },
    });
    if (!activeSubscription || !activeSubscription.isActive) {
      throw new UnauthorizedException(
        'Active subscription required to add users',
      );
    }
    const count = await this.prisma.user.count({
      where: { adminRefID: adminId },
    });
    if (count >= 4) {
      throw new BadRequestException('User limit reached (max 4)');
    }
    const emailExists = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await this.encryptPassword(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: passwordHash,
        phoneNumber: dto.phoneNumber,
        role: 'USER',
        adminRefID: adminId,
      },
      select: { id: true, email: true, username: true, adminRefID: true },
    });
  }

  async deleteSubUserForAdmin(adminId: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.adminRefID !== adminId) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'USER') {
      throw new BadRequestException('Cannot delete admin or owner accounts');
    }
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async uploadUserPhoto(userId: number, photoPath: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: photoPath },
    });
    return { message: 'Photo uploaded', path: photoPath };
  }

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async encryptPassword(plainText: string, saltRound: number) {
    return await bcrypt.hash(plainText, saltRound);
  }

  async decryptPassword(plainText: string, hash: string) {
    return await bcrypt.compare(plainText, hash);
  }
}
