
'use server';

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false; // Handle case where hash might be undefined
  return bcrypt.compare(password, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function comparePin(pin: string, hash: string): Promise<boolean> {
  if (!hash) return false; // Handle case where hash might be undefined for a pin
  return bcrypt.compare(pin, hash);
}
