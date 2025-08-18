import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PairingController } from './pairing.controller';
import { PairingService } from './pairing.service';

@Module({
  controllers: [PairingController],
  providers: [PairingService, PrismaService],
})
export class PairingModule {}
