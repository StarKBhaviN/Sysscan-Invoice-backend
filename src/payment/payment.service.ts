import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private readonly cashfreeBase = 'https://sandbox.cashfree.com/pg/orders'; // Sandbox orders API
  private readonly clientId = process.env.CASHFREE_CLIENT_ID;
  private readonly clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.payment.findMany();
  }

  async create(data: any) {
    return this.prisma.payment.create({ data });
  }

  async getByUser(userID: number) {
    return this.prisma.payment.findMany({
      where: { userID: userID },
    });
  }

  async getByOrderId(orderId: string) {
    return this.prisma.payment.findFirst({ where: { orderID: orderId } });
  }

  async createMockCheckout(userId: number, amount: number, provider = 'mock') {
    const orderId = uuidv4();

    try {
      await this.prisma.payment.create({
        data: {
          userID: userId,
          amount: amount,
          status: 'pending',
          orderID: orderId,
          subscriptionID: null, // will set later on success
        },
      });
      console.log('Created dummy data');

      const response = await axios.post(
        this.cashfreeBase,
        {
          order_id: orderId,
          order_amount: amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: String(userId),
            customer_email: 'test@example.com', // Replace dynamically
            customer_phone: '9999999999', // Replace dynamically
          },
          order_meta: {
            return_url_success: `myapp://payment-success?order_id=${orderId}`,
            return_url_failure: `myapp://payment-failed?order_id=${orderId}`,
            notify_url: `https://da3fd4a5d059.ngrok-free.app/payment/webhook`,
          },
        },
        {
          headers: {
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
            'Content-Type': 'application/json',
            'x-api-version': '2022-01-01',
          },
        },
      );
      console.log('repsonse : ', response.data);

      const checkoutUrl = response.data.payment_link;

      return {
        checkoutUrl,
        provider: 'cashfree',
        orderId,
        amount,
        userId,
      };
    } catch (error) {
      console.error(
        'Cashfree Checkout Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create Cashfree checkout session');
    }
  }

  async handleCashfreeWebhook(body: any) {
    const { payment, customer_details } = body.data;

    const orderId = body.data.order.order_id;
    const userId = parseInt(customer_details.customer_id, 10);

    // Find the payment record
    const paymentRecord = await this.prisma.payment.findUnique({
      where: { orderID: orderId },
    });

    if (!paymentRecord) {
      console.error('Payment record not found for order:', orderId);
      return { ok: false };
    }

    // Only update if payment succeeded
    if (payment.payment_status === 'SUCCESS') {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);

      const subscription = await this.prisma.subscription.upsert({
        where: { userID: userId },
        update: {
          isActive: true,
          startDate: now,
          endDate: end,
          paymentMethod: 'cashfree',
        },
        create: {
          userID: userId,
          isActive: true,
          startDate: now,
          endDate: end,
          paymentMethod: 'cashfree',
        },
      });

      await this.prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'succeeded',
          subscriptionID: subscription.id,
        },
      });

      // Promote role if needed
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role !== 'ADMIN' && user.role !== 'OWNER') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { role: 'ADMIN' },
        });
      }

      return { ok: true, rolePromoted: true };
    } else {
      // Update status to failed
      await this.prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: 'failed' },
      });
      return { ok: true, rolePromoted: false };
    }
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
        orderID: subscription.id.toString(), // change it
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
