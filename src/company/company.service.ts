import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.company.findMany();
  }

  async getByUser(userID: number) {
    return this.prisma.company.findMany({
      where: { userID },
    });
  }

  async create(data: any) {
    return this.prisma.company.create({ data });
  }
}
