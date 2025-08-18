import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/users/auth.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './DTOs/create-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMyCompanies(@Req() req) {
    return this.service.getByUser(req.user.id);
  }

  @Post()
  create(@Body() dto: CreateCompanyDTO) {
    return this.service.create(dto);
  }
}
