import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  providers: [PrismaService, SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
