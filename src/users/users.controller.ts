import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { createUserDTO } from './create-user-dto';
import { LoginDTO } from './login-dto';
import { UsersService } from './users.service';

@Controller('users') // Base url it can be anything use it before the route : users/signup
export class UsersController {
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

  @UseGuards(AuthGuard)
  //   @Roles('admin')
  @Get('/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
