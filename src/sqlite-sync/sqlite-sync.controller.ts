import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/users/auth.guard';
import { SqliteSyncService } from './sqlite-sync.service';

@Controller('sqlite')
export class SqliteSyncController {
  constructor(private readonly service: SqliteSyncService) {}

  @UseGuards(AuthGuard)
  @Post('register')
  register(
    @Req() req,
    @Body() body: { provider: 'firebase' | 'aws' | 'url'; url: string },
  ) {
    return this.service.registerRemoteDb(req.user.id, body.provider, body.url);
  }

  @UseGuards(AuthGuard)
  @Post('sync')
  sync(@Req() req) {
    return this.service.downloadAndOpen(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('meta')
  meta(@Req() req) {
    return this.service.openLocal(req.user.id);
  }
}
