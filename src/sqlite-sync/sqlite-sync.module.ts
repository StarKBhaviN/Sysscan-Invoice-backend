import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SqliteSyncController } from './sqlite-sync.controller';
import { SqliteSyncService } from './sqlite-sync.service';

@Module({
  controllers: [SqliteSyncController],
  providers: [SqliteSyncService, PrismaService],
})
export class SqliteSyncModule {}
