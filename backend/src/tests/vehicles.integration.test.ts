import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server';
import prisma from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

function token(role: 'USER' | 'ADMIN') {
  return jwt.sign({ userId: 1, role }, JWT_SECRET, { expiresIn: '1h' });
}

const userToken = token('USER');
const adminToken = token('ADMIN');

async function createVehicle(overrides = {}) {
  return prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5, ...overrides },
  });
}

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
});

// ─── LISTING ────────────────────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  it('authenticated user can list vehicles', async () => {
    await createVehicle();
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('ADMIN can list vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('empty database returns empty array', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

// ─── SEARCH ─────────────────────────────────────────────────────────────────

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 },
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 35000, quantity: 3 },
        { make: 'Ford', model: 'F-150', category: 'TRUCK', price: 45000, quantity: 2 },
      ],
    });
  });

  it('filters by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('filters by model', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?model=Camry')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].model).toBe('Camry');
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=TRUCK')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by minPrice', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=40000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].make).toBe('Ford');
  });

  it('filters by maxPrice', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?maxPrice=30000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].model).toBe('Camry');
  });

  it('combines multiple filters', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota&category=SUV')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].model).toBe('RAV4');
  });

  it('returns empty array when no vehicles match', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=BMW')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

// ─── CREATE ──────────────────────────────────────────────────────────────────

describe('POST /api/vehicles', () => {
  const valid = { make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 };

  it('ADMIN can create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(valid);
    expect(res.status).toBe(201);
    expect(res.body.data.make).toBe('Toyota');
  });

  it('USER receives 403', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(valid);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request receives 401', async () => {
    const res = await request(app).post('/api/vehicles').send(valid);
    expect(res.status).toBe(401);
  });

  it('rejects missing make', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, make: '' });
    expect(res.status).toBe(400);
  });

  it('rejects missing model', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, model: '' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, category: 'SPACESHIP' });
    expect(res.status).toBe(400);
  });

  it('rejects price <= 0', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, price: 0 });
    expect(res.status).toBe(400);
  });

  it('rejects negative quantity', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, quantity: -1 });
    expect(res.status).toBe(400);
  });

  it('rejects non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...valid, quantity: 1.5 });
    expect(res.status).toBe(400);
  });
});

// ─── PURCHASE ────────────────────────────────────────────────────────────────

describe('POST /api/vehicles/:id/purchase', () => {
  it('authenticated user can purchase a vehicle', async () => {
    const v = await createVehicle({ quantity: 3 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it('quantity decreases by exactly 1', async () => {
    const v = await createVehicle({ quantity: 3 });
    await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    const updated = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(updated!.quantity).toBe(2);
  });

  it('purchase succeeds when quantity > 0', async () => {
    const v = await createVehicle({ quantity: 1 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it('purchase fails when quantity is 0', async () => {
    const v = await createVehicle({ quantity: 0 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(409);
  });

  it('quantity never becomes negative', async () => {
    const v = await createVehicle({ quantity: 0 });
    await request(app)
      .post(`/api/vehicles/${v.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);
    const updated = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(updated!.quantity).toBeGreaterThanOrEqual(0);
  });

  it('returns 404 for unknown vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/99999/purchase')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it('unauthenticated request returns 401', async () => {
    const v = await createVehicle();
    const res = await request(app).post(`/api/vehicles/${v.id}/purchase`);
    expect(res.status).toBe(401);
  });
});

// ─── RESTOCK ─────────────────────────────────────────────────────────────────

describe('POST /api/vehicles/:id/restock', () => {
  it('ADMIN can restock a vehicle', async () => {
    const v = await createVehicle({ quantity: 0 });
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });
    expect(res.status).toBe(200);
  });

  it('quantity increases by the requested amount', async () => {
    const v = await createVehicle({ quantity: 2 });
    await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });
    const updated = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(updated!.quantity).toBe(7);
  });

  it('rejects non-positive amount', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 0 });
    expect(res.status).toBe(400);
  });

  it('rejects non-integer amount', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2.5 });
    expect(res.status).toBe(400);
  });

  it('USER receives 403', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .post(`/api/vehicles/${v.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5 });
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/99999/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });
    expect(res.status).toBe(404);
  });
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────

describe('PUT /api/vehicles/:id', () => {
  it('ADMIN can update a vehicle', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(30000);
  });

  it('USER receives 403', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 30000 });
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000 });
    expect(res.status).toBe(404);
  });

  it('rejects invalid price', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -100 });
    expect(res.status).toBe(400);
  });

  it('rejects invalid quantity', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -1 });
    expect(res.status).toBe(400);
  });

  it('rejects invalid category', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .put(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'BOAT' });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/vehicles/:id', () => {
  it('ADMIN can delete a vehicle', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .delete(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('USER receives 403', async () => {
    const v = await createVehicle();
    const res = await request(app)
      .delete(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown vehicle', async () => {
    const res = await request(app)
      .delete('/api/vehicles/99999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('deleted vehicle no longer appears in listing', async () => {
    const v = await createVehicle();
    await request(app)
      .delete(`/api/vehicles/${v.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const list = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.data.find((x: { id: number }) => x.id === v.id)).toBeUndefined();
  });
});
