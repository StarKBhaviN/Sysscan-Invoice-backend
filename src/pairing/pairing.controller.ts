import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/users/auth.guard';
import { PairingService } from './pairing.service';

@Controller('pairing')
export class PairingController {
  constructor(private readonly service: PairingService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Req() req) {
    return this.service.createPairingForUser(req.user.id);
  }

  @Post('activate')
  activate(@Body() body: { code: string; desktopClientId: string }) {
    return this.service.activatePairing(body.code, body.desktopClientId);
  }

  @UseGuards(AuthGuard)
  @Get()
  list(@Req() req) {
    return this.service.getUserPairings(req.user.id);
  }
}
