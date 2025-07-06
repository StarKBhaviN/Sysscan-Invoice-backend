import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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
}
