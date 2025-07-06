import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getAllSubscription() {
    return this.prisma.subscription.findMany();
  }

  async getByUserId(userID: number) {
    return this.prisma.subscription.findUnique({
      where: { userID },
    });
  }

  async create(data: any) {
    return this.prisma.subscription.create({ data });
  }
}
