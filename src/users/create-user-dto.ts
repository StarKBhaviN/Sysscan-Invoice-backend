// Define validation for request body

import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from 'src/roles/roles.enum';

export class createUserDTO {
  // could be empty and must be string
  @IsOptional()
  @IsString()
  firstName?: string;

  // could be empty and must be string
  @IsOptional()
  @IsString()
  lastName?: string;

  // Email format and not empty
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // could not be empty
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  // could not be empty
  @IsNotEmpty()
  @IsBoolean()
  blocked: boolean;

  @IsEnum(Role)
  @IsOptional()
  role: Role;
}
