import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import {
  CustomerRole,
  Gender,
  PlayerPosition,
  DominantFoot,
} from '../../../common/enums/identity.enum.js';

@Entity('customers')
export class Customer extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({
    name: 'default_role',
    type: 'enum',
    enum: CustomerRole,
    default: CustomerRole.PLAYER,
  })
  defaultRole: CustomerRole;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.MALE,
  })
  gender: Gender;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({
    name: 'preferred_position',
    type: 'enum',
    enum: PlayerPosition,
    nullable: true,
  })
  preferredPosition: PlayerPosition | null;

  @Column({
    name: 'dominant_foot',
    type: 'enum',
    enum: DominantFoot,
    nullable: true,
  })
  dominantFoot: DominantFoot | null;

  @Column({ name: 'region_id', type: 'bigint', nullable: true })
  regionId: number | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}