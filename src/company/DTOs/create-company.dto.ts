import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  userID: number;

  @IsOptional()
  invoices?: object;

  @IsOptional()
  sales?: object;

  @IsOptional()
  purchases?: object;

  @IsOptional()
  receivables?: object;

  @IsOptional()
  payables?: object;
}
