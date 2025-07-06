import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSubscriptionDTO } from './DTOs/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Get()
  getAll() {
    return this.service.getAllSubscription();
  }

  @Get(':userID')
  getByUser(@Param('userID') userID: string) {
    return this.service.getByUserId(+userID);
  }

  @Post()
  create(@Body() dto: CreateSubscriptionDTO) {
    return this.service.create(dto);
  }
}
