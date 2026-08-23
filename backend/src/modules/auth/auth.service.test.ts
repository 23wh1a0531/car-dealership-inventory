import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client';
import { registerUser } from './auth.service';

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe('registerUser', () => {
  it('creates a user with valid data', async () => {
    const user = await registerUser('test@example.com', 'password123');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('USER');
  });

  it('does not return passwordHash', async () => {
    const user = await registerUser('test@example.com', 'password123');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('stores password as bcrypt hash', async () => {
    await registerUser('test@example.com', 'password123');
    const stored = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    expect(stored).not.toBeNull();
    const match = await bcrypt.compare('password123', stored!.passwordHash);
    expect(match).toBe(true);
  });

  it('throws on duplicate email', async () => {
    await registerUser('test@example.com', 'password123');
    await expect(registerUser('test@example.com', 'password123')).rejects.toThrow('Email already in use');
  });

  it('throws on invalid email', async () => {
    await expect(registerUser('not-an-email', 'password123')).rejects.toThrow('Invalid email');
  });

  it('throws when password is shorter than 8 characters', async () => {
    await expect(registerUser('test@example.com', 'short')).rejects.toThrow('Password must be at least 8 characters');
  });
});
