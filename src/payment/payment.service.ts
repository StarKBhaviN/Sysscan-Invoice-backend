import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.payment.findMany();
  }

  async create(data: any) {
    return this.prisma.payment.create({ data });
  }

  async getByUser(userID: number) {
    return this.prisma.payment.findMany({
      where: { userID },
    });
  }

  async createMockCheckout(userId: number, amount: number, provider = 'mock') {
    const sessionId = uuidv4();
    // In real integration, return provider hosted url. Here we return mock URL that later hits webhook
    return {
      checkoutUrl: `https://payments.example/mock/checkout/${sessionId}`,
      provider,
      sessionId,
      amount,
      userId,
    };
  }

  async handleMockWebhook(body: {
    event: string;
    data: { userId: number; amount: number; status: string };
  }) {
    const { event, data } = body;
    if (event !== 'payment.succeeded' || data.status !== 'succeeded') {
      return { ok: true };
    }
    const userId = data.userId;
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const subscription = await this.prisma.subscription.upsert({
      where: { userID: userId },
      update: {
        isActive: true,
        startDate: now,
        endDate: end,
        paymentMethod: 'mock',
      },
      create: {
        userID: userId,
        isActive: true,
        startDate: now,
        endDate: end,
        paymentMethod: 'mock',
      },
    });

    await this.prisma.payment.create({
      data: {
        amount: data.amount,
        status: 'succeeded',
        subscriptionID: subscription.id,
        userID: userId,
      },
    });

    // Promote user to ADMIN on first successful subscription payment
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    let rolePromoted = false;
    if (user && user.role !== 'ADMIN' && user.role !== 'OWNER') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
      rolePromoted = true;
    }

    return { ok: true, rolePromoted };
  }
}
