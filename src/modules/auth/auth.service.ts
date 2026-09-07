import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Customer } from '../customers/entities/customer.entity.js';
import { CustomerToken } from './entities/customer-token.entity.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerToken)
    private readonly tokenRepository: Repository<CustomerToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerCustomer(dto: RegisterCustomerDto) {
    this.logger.log(`Memproses registrasi customer email: ${dto.email}`);

    const existingCustomer = await this.customerRepository.findOne({
      where: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
    });

    if (existingCustomer) {
      throw new ConflictException(
        'Email atau nomor telepon sudah terdaftar di sistem',
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newCustomer = this.customerRepository.create({
      email: dto.email,
      phone: dto.phone || null,
      fullName: dto.fullName,
      nickname: dto.nickname || null,
      passwordHash,
    });

    const savedCustomer = await this.customerRepository.save(newCustomer);
    this.logger.log(`Customer berhasil terdaftar dengan ID: ${savedCustomer.id}`);

    // Return tanpa passwordHash
    const { passwordHash: _, ...result } = savedCustomer;
    return result;
  }

  async loginCustomer(
    dto: LoginCustomerDto,
    meta: { userAgent?: string; ipAddress?: string },
  ) {
    this.logger.log(`Upaya login customer: ${dto.email}`);

    const customer = await this.customerRepository.findOne({
      where: { email: dto.email },
    });

    if (!customer || !customer.isActive) {
      this.logger.warn(`Login gagal untuk email: ${dto.email} (User tidak ditemukan/nonaktif)`);
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      customer.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login gagal untuk email: ${dto.email} (Password salah)`);
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const tokens = await this.generateTokens(customer.id, customer.email, customer.defaultRole);
    await this.saveRefreshToken(customer.id, tokens.refreshToken, meta);

    const { passwordHash: _, ...customerData } = customer;

    return {
      customer: customerData,
      tokens,
    };
  }

  async loginUser(dto: LoginCustomerDto) {
    this.logger.log(`Upaya login staf internal: ${dto.email}`);

    const user = await this.customerRepository.manager
      .getRepository(User)
      .findOne({ where: { email: dto.email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { passwordHash: _, ...userData } = user;

    return {
      user: userData,
      tokens,
    };
  }

  async refreshToken(
    dto: RefreshTokenDto,
    meta: { userAgent?: string; ipAddress?: string },
  ) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const customer = await this.customerRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!customer) {
        throw new UnauthorizedException('Sesi tidak valid');
      }

      // Cari active session tokens di DB
      const activeTokens = await this.tokenRepository.find({
        where: { customerId: customer.id, isRevoked: false },
      });

      let validSession: CustomerToken | null = null;
      for (const tokenEntity of activeTokens) {
        const isMatch = await bcrypt.compare(
          dto.refreshToken,
          tokenEntity.refreshTokenHash,
        );
        if (isMatch) {
          validSession = tokenEntity;
          break;
        }
      }

      if (!validSession || validSession.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token telah kadaluarsa atau dicabut');
      }

      // Revoke token lama (Token Rotation)
      validSession.isRevoked = true;
      await this.tokenRepository.save(validSession);

      // Generate token pair baru
      const newTokens = await this.generateTokens(customer.id, customer.email, customer.defaultRole);
      await this.saveRefreshToken(customer.id, newTokens.refreshToken, meta);

      return newTokens;
    } catch (error) {
      this.logger.error('Gagal memperbarui token', error);
      throw new UnauthorizedException('Sesi tidak valid atau telah kadaluarsa');
    }
  }

  private async generateTokens(
    customerId: string,
    email: string,
    role: string,
  ) {
    const payload = { sub: customerId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1d') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    customerId: string,
    refreshToken: string,
    meta: { userAgent?: string; ipAddress?: string },
  ) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 Hari Sesuai Expiry

    const tokenEntity = this.tokenRepository.create({
      customerId,
      refreshTokenHash,
      userAgent: meta.userAgent || null,
      ipAddress: meta.ipAddress || null,
      expiresAt,
    });

    await this.tokenRepository.save(tokenEntity);
  }
}