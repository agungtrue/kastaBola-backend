import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/register')
  @ResponseMessage('Registrasi customer berhasil')
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('customer/login')
  @ResponseMessage('Login berhasil')
  async loginCustomer(
    @Body() dto: LoginCustomerDto,
    @Req() req: Request,
  ) {
    const meta = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    };
    return this.authService.loginCustomer(dto, meta);
  }

  @Post('customer/refresh')
  @ResponseMessage('Perbarui token berhasil')
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const meta = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    };
    return this.authService.refreshToken(dto, meta);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ResponseMessage('Profil berhasil diambil')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('user/login')
  @ResponseMessage('Login admin berhasil')
  async loginUser(@Body() dto: LoginCustomerDto) {
    return this.authService.loginUser(dto);
  }
}