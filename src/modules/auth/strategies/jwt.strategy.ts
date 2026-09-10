import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Customer } from '../../customers/entities/customer.entity.js';
import { AccountType, UserRole, CustomerRole } from '../../../common/enums/identity.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  accountType: AccountType;
  role: UserRole | CustomerRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'kastabola_super_secret_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.accountType === AccountType.STAFF) {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!user) {
        throw new UnauthorizedException('Sesi staff tidak valid atau non-aktif');
      }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        accountType: AccountType.STAFF,
      };
    }

    if (payload.accountType === AccountType.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!customer) {
        throw new UnauthorizedException('Sesi customer tidak valid atau non-aktif');
      }
      return {
        id: customer.id,
        email: customer.email,
        role: customer.role,
        teamId: customer.teamId,
        accountType: AccountType.CUSTOMER,
      };
    }

    throw new UnauthorizedException('Tipe akun dalam token tidak dikenali');
  }
}