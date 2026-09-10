import { randomBytes } from 'crypto';

export function generateMatchPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateRefereeToken(): string {
  return `REF-${randomBytes(12).toString('hex').toUpperCase()}`;
}