import { SetMetadata } from '@nestjs/common';
import { UserRole, CustomerRole } from '../enums/identity.enum.js';

export const ROLES_KEY = 'roles';
export type AllowedRole = UserRole | CustomerRole;

export const AuthRoles = (...roles: AllowedRole[]) =>
  SetMetadata(ROLES_KEY, roles);