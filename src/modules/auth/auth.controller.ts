import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return await this.authService.registerCustomer(dto);
  }

  @Post('login')
  async loginCustomer(@Body() dto: LoginCustomerDto) {
    return await this.authService.loginCustomer(dto);
  }

  @Post('staff/login')
  async loginStaff(@Body() dto: LoginCustomerDto) {
    return await this.authService.loginStaff(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}