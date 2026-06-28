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
    const expiresAt = new Date(Date.now() + 60 * 1000); // 10 minutes expiry

    // Check if pairing already exists for this user
    const existingPairing = await (this.prisma as any).pairing.findFirst({
      where: { userID: userId },
    });

    if (existingPairing) {
      // Update existing record
      return (this.prisma as any).pairing.update({
        where: { id: existingPairing.id },
        data: { code, expiresAt, isActive: false, desktopClientId: null },
        select: { id: true, code: true, expiresAt: true },
      });
    }

    // Otherwise, create new record
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

  async getPairingStatus(code: string) {
    const pairing = await (this.prisma as any).pairing.findUnique({
      where: { code },
      select: {
        id: true,
        isActive: true,
        desktopClientId: true,
        expiresAt: true,
      },
    });

    if (!pairing) throw new NotFoundException('Invalid code');
    if (pairing.expiresAt < new Date())
      throw new BadRequestException('Code expired');

    return pairing;
  }

  async getUserPairings(userId: number) {
    return (this.prisma as any).pairing.findMany({ where: { userID: userId } });
  }
}
