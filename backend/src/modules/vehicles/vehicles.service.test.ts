import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../prisma/client';
import {
  listVehicles,
  createVehicle,
  purchaseVehicle,
  restockVehicle,
  updateVehicle,
  deleteVehicle,
} from './vehicles.service';

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
});

const base = { make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 25000, quantity: 5 };

describe('createVehicle', () => {
  it('creates a vehicle with valid data', async () => {
    const v = await createVehicle(base);
    expect(v.make).toBe('Toyota');
    expect(v.id).toBeDefined();
  });

  it('throws on empty make', async () => {
    await expect(createVehicle({ ...base, make: '' })).rejects.toThrow('make is required');
  });

  it('throws on empty model', async () => {
    await expect(createVehicle({ ...base, model: '' })).rejects.toThrow('model is required');
  });

  it('throws on invalid category', async () => {
    await expect(createVehicle({ ...base, category: 'BOAT' })).rejects.toThrow('category');
  });

  it('throws on price <= 0', async () => {
    await expect(createVehicle({ ...base, price: 0 })).rejects.toThrow('price');
  });

  it('throws on negative quantity', async () => {
    await expect(createVehicle({ ...base, quantity: -1 })).rejects.toThrow('quantity');
  });
});

describe('listVehicles', () => {
  it('returns all vehicles', async () => {
    await createVehicle(base);
    await createVehicle({ ...base, make: 'Ford' });
    const list = await listVehicles();
    expect(list).toHaveLength(2);
  });

  it('returns empty array when no vehicles', async () => {
    const list = await listVehicles();
    expect(list).toEqual([]);
  });
});

describe('purchaseVehicle', () => {
  it('decrements quantity by 1', async () => {
    const v = await createVehicle({ ...base, quantity: 3 });
    await purchaseVehicle(v.id);
    const updated = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(updated!.quantity).toBe(2);
  });

  it('throws when out of stock', async () => {
    const v = await createVehicle({ ...base, quantity: 0 });
    await expect(purchaseVehicle(v.id)).rejects.toThrow('Out of stock');
  });

  it('throws for unknown vehicle', async () => {
    await expect(purchaseVehicle(99999)).rejects.toThrow('Vehicle not found');
  });
});

describe('restockVehicle', () => {
  it('increases quantity by amount', async () => {
    const v = await createVehicle({ ...base, quantity: 2 });
    await restockVehicle(v.id, 5);
    const updated = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(updated!.quantity).toBe(7);
  });

  it('throws for non-positive amount', async () => {
    const v = await createVehicle(base);
    await expect(restockVehicle(v.id, 0)).rejects.toThrow('positive integer');
  });

  it('throws for unknown vehicle', async () => {
    await expect(restockVehicle(99999, 5)).rejects.toThrow('Vehicle not found');
  });
});

describe('updateVehicle', () => {
  it('updates specified fields', async () => {
    const v = await createVehicle(base);
    const updated = await updateVehicle(v.id, { price: 30000 });
    expect(updated.price).toBe(30000);
  });

  it('throws for unknown vehicle', async () => {
    await expect(updateVehicle(99999, { price: 30000 })).rejects.toThrow('Vehicle not found');
  });
});

describe('deleteVehicle', () => {
  it('deletes the vehicle', async () => {
    const v = await createVehicle(base);
    await deleteVehicle(v.id);
    const found = await prisma.vehicle.findUnique({ where: { id: v.id } });
    expect(found).toBeNull();
  });

  it('throws for unknown vehicle', async () => {
    await expect(deleteVehicle(99999)).rejects.toThrow('Vehicle not found');
  });
});
