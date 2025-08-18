import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { PairingModule } from './pairing/pairing.module';
import { PaymentModule } from './payment/payment.module';
import { SqliteSyncModule } from './sqlite-sync/sqlite-sync.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    SubscriptionModule,
    PaymentModule,
    CompanyModule,
    PairingModule,
    SqliteSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
