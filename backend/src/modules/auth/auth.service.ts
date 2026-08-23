import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerUser(email: string, password: string) {
  if (!EMAIL_RE.test(email)) throw new Error('Invalid email');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const secret = process.env.JWT_SECRET ?? 'dev-secret';
  const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '24h' });

  return { token };
}
