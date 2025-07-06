import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [UsersModule, SubscriptionModule, PaymentModule, CompanyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
