import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';
import { AccountType } from '../../common/enums/identity.enum.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Registrasi Customer (App Users)
  async registerCustomer(dto: RegisterCustomerDto) {
    console.log({ dto })
    const existingEmail = await this.customerRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const existingPhone = await this.customerRepository.findOne({
      where: { phone: dto.phone },
  });
    if (existingPhone) {
      throw new BadRequestException('Nomor telepon sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const customer = this.customerRepository.create({
      ...dto,
      passwordHash,
    });

    const saved = await this.customerRepository.save(customer);

    return this.generateToken(saved.id, saved.email, saved.role, AccountType.CUSTOMER);
  }

  // 2. Login Customer
  async loginCustomer(dto: LoginCustomerDto) {
    const customer = await this.customerRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    const isMatch = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    return this.generateToken(customer.id, customer.email, customer.role, AccountType.CUSTOMER);
  }

  // 3. Login Staff (Backoffice)
  async loginStaff(dto: LoginCustomerDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Kredensial staff tidak valid');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial staff tidak valid');
    }

    return this.generateToken(user.id, user.email, user.role, AccountType.STAFF);
  }

  private generateToken(
    sub: string,
    email: string,
    role: string,
    accountType: AccountType,
  ) {
    const payload = { sub, email, role, accountType };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { sub, email, role, accountType },
    };
  }
}