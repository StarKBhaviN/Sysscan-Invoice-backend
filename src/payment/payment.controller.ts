import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePaymentDTO } from './DTOs/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get(':userID')
  getByUser(@Param('userID') userID: string) {
    return this.service.getByUser(+userID);
  }

  @Post()
  create(@Body() dto: CreatePaymentDTO) {
    return this.service.create(dto);
  }
}
