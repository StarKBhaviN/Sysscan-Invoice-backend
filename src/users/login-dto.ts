// Define validation for request body

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  // Email format and not empty
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // could not be empty
  @IsNotEmpty()
  @IsString()
  password: string;
}
