import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { addMonths } from '../utils/date';

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
    // Simple helper to default period if not provided
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate
      ? new Date(data.endDate)
      : addMonths(startDate, 1);
    return this.prisma.subscription.create({
      data: { ...data, startDate, endDate, isActive: data.isActive ?? true },
    });
  }
}
