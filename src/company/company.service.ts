import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.company.findMany();
  }

  async getByUser(userID: number) {
    // Prefer local SQLite if registered and downloaded
    const meta = await (this.prisma as any).sqliteFile.findFirst({
      where: { userID },
    });
    if (meta?.localPath && existsSync(meta.localPath)) {
      const db = new Database(meta.localPath, { readonly: true });
      // Expect table names accordingly; fallback to Prisma if missing
      try {
        const companies = db
          .prepare('SELECT id, name, address FROM Company')
          .all();
        return companies;
      } catch (e) {
        // fallback
      }
    }
    return this.prisma.company.findMany({ where: { userID } });
  }

  async create(data: any) {
    return this.prisma.company.create({ data });
  }
}
