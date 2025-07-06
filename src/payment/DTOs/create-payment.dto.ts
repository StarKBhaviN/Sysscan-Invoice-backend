import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDTO {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  subscriptionID: number;

  @IsNumber()
  @IsNotEmpty()
  userID: number;
}
