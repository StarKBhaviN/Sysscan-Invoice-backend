import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth.guard';
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

  // Mock checkout session creator - authenticated admin
  @UseGuards(AuthGuard)
  @Post('checkout')
  createCheckout(
    @Req() req,
    @Body() body: { amount: number; provider?: string },
  ) {
    const userId = req.user.id;
    return this.service.createMockCheckout(userId, body.amount, body.provider);
  }

  // Mock webhook to activate subscription
  @Post('webhook')
  webhook(
    @Body()
    body: {
      event: string;
      data: { userId: number; amount: number; status: string };
    },
  ) {
    return this.service.handleMockWebhook(body);
  }
}
