import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server';
import prisma from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

function makeToken(payload: object, expiresIn: string | number = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();
});

describe('JWT Authentication middleware', () => {
  it('allows access with a valid token', async () => {
    const token = makeToken({ userId: 1, role: 'USER' });
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 when token is missing', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed token', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer not.a.token');
    expect(res.status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const token = makeToken({ userId: 1, role: 'USER' }, -1);
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

describe('Role authorization middleware', () => {
  it('allows ADMIN to access admin-only route', async () => {
    const token = makeToken({ userId: 1, role: 'ADMIN' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 });
    expect(res.status).toBe(201);
  });

  it('returns 403 when USER tries admin-only route', async () => {
    const token = makeToken({ userId: 1, role: 'USER' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 });
    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated on admin-only route', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 });
    expect(res.status).toBe(401);
  });
});
