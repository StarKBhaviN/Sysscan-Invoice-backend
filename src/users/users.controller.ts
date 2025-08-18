import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/roles/role.decorator';
import { Role } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { AuthGuard } from './auth.guard';
import { AdminCreateUserDTO } from './dtos/admin-create-user.dto';
import { createUserDTO } from './dtos/create-user-dto';
import { LoginDTO } from './dtos/login-dto';
import { UsersService } from './users.service';

@Controller('users') // Base url it can be anything use it before the route : users/signup
export class UsersController {
  prisma: any;
  constructor(private userService: UsersService) {}
  @Post('/signup')
  async create(
    @Body()
    createUserDTO: createUserDTO,
  ) {
    // firstName, lastName, email, password, createdAt
    return await this.userService.signup(createUserDTO); // This will be the response
  }

  @Post('/login')
  async login(
    @Body()
    loginDTO: LoginDTO,
  ) {
    // firstName, lastName, email, password, createdAt
    return await this.userService.login(loginDTO); // This will be the response
  }

  // Optional: issue a fresh token reflecting any updated role after subscription activation
  @UseGuards(AuthGuard)
  @Post('/refresh-token')
  async refreshToken(@Request() req) {
    return this.userService.issueFreshToken(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('/profile')
  @Roles(Role.User)
  async getProfile(@Request() req) {
    const userId = req.user.id;

    const user = await this.userService.getUserProfile(userId);

    return user;
  }

  // Admin: list own sub-users
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @Roles(Role.Admin, Role.Owner)
  async getUsers(@Request() req) {
    const requester = req.user;
    if (requester.role === Role.Owner) {
      return this.userService.getAllUsers();
    }
    return this.userService.getSubUsersForAdmin(requester.id);
  }

  // Admin: add sub-user (max 4, active subscription required)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/add')
  @Roles(Role.Admin, Role.Owner)
  async addUser(@Request() req, @Body() dto: AdminCreateUserDTO) {
    const adminId = req.user.id;
    return this.userService.addSubUserForAdmin(adminId, dto);
  }

  // Admin: delete sub-user by id
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  async deleteUser(@Request() req, @Param('id') id: string) {
    const adminId = req.user.id;
    const userId = +id;
    if (req.user.role === Role.Owner) {
      // Owner can delete any non-admin
      return this.userService.deleteUser(userId);
    }
    return this.userService.deleteSubUserForAdmin(adminId, userId);
  }

  // Upload photo for current user
  @UseGuards(AuthGuard)
  @Post('/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = './uploads/profile';
          try {
            require('fs').mkdirSync(dest, { recursive: true });
          } catch (e) {}
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            (req as any).user.id +
              '-' +
              uniqueSuffix +
              extname(file.originalname),
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async addPhoto(@Request() req, @UploadedFile() file: any) {
    const path = file?.path;
    return this.userService.uploadUserPhoto(req.user.id, path);
  }
}
