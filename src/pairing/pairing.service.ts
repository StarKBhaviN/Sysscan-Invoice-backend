import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PairingService {
  constructor(private prisma: PrismaService) {}

  async createPairingForUser(userId: number) {
    const code = uuidv4().split('-')[0].toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return (this.prisma as any).pairing.create({
      data: { userID: userId, code, expiresAt },
      select: { id: true, code: true, expiresAt: true },
    });
  }

  async activatePairing(code: string, desktopClientId: string) {
    const pairing = await (this.prisma as any).pairing.findUnique({
      where: { code },
    });
    if (!pairing) throw new NotFoundException('Invalid code');
    if (pairing.expiresAt < new Date())
      throw new BadRequestException('Code expired');
    return (this.prisma as any).pairing.update({
      where: { id: pairing.id },
      data: { desktopClientId, isActive: true },
      select: { id: true, userID: true, isActive: true },
    });
  }

  async getUserPairings(userId: number) {
    return (this.prisma as any).pairing.findMany({ where: { userID: userId } });
  }
}
