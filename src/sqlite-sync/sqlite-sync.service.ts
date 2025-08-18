import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SqliteSyncService {
  constructor(private prisma: PrismaService) {}

  private getLocalDirForUser(userId: number) {
    const dir = join(process.cwd(), 'data', 'sqlite', String(userId));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async registerRemoteDb(
    userId: number,
    provider: 'firebase' | 'aws' | 'url',
    remoteUrl: string,
  ) {
    const record = await (this.prisma as any).sqliteFile.upsert({
      where: { userID: userId },
      update: { storageProvider: provider, remoteUrl },
      create: { userID: userId, storageProvider: provider, remoteUrl },
    });
    return record;
  }

  async downloadAndOpen(userId: number) {
    const meta = await (this.prisma as any).sqliteFile.findFirst({
      where: { userID: userId },
    });
    if (!meta) throw new BadRequestException('No remote database registered');
    const dir = this.getLocalDirForUser(userId);
    const localPath = join(dir, 'company.db');
    const resp = await axios.get<ArrayBuffer>(meta.remoteUrl, {
      responseType: 'arraybuffer',
    });
    writeFileSync(localPath, Buffer.from(resp.data));
    await (this.prisma as any).sqliteFile.update({
      where: { id: meta.id },
      data: { localPath, lastSyncedAt: new Date() },
    });
    const db = new Database(localPath, { readonly: true });
    return { localPath, ok: true };
  }

  openLocal(userId: number) {
    const meta = (this.prisma as any).sqliteFile.findFirst({
      where: { userID: userId },
    });
    return meta;
  }
}
