import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './DTOs/create-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get(':userID')
  getByUser(@Param('userID') userID: string) {
    return this.service.getByUser(+userID);
  }

  @Post()
  create(@Body() dto: CreateCompanyDTO) {
    return this.service.create(dto);
  }
}
