import prisma from '../../prisma/client';

const VALID_CATEGORIES = ['SEDAN', 'SUV', 'TRUCK', 'HATCHBACK', 'COUPE'];

function validateVehicleFields(data: {
  make?: unknown;
  model?: unknown;
  category?: unknown;
  price?: unknown;
  quantity?: unknown;
}) {
  if (data.make !== undefined && (typeof data.make !== 'string' || !data.make.trim())) {
    throw new Error('make is required');
  }
  if (data.model !== undefined && (typeof data.model !== 'string' || !data.model.trim())) {
    throw new Error('model is required');
  }
  if (data.category !== undefined && !VALID_CATEGORIES.includes(data.category as string)) {
    throw new Error(`category must be one of ${VALID_CATEGORIES.join(', ')}`);
  }
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
    throw new Error('price must be greater than 0');
  }
  if (data.quantity !== undefined) {
    if (!Number.isInteger(data.quantity) || (data.quantity as number) < 0) {
      throw new Error('quantity must be a non-negative integer');
    }
  }
}

export async function listVehicles() {
  return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function searchVehicles(filters: {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return prisma.vehicle.findMany({
    where: {
      ...(filters.make && { make: { contains: filters.make } }),
      ...(filters.model && { model: { contains: filters.model } }),
      ...(filters.category && { category: filters.category }),

      ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createVehicle(data: {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}) {
  if (!data.make?.trim()) throw new Error('make is required');
  if (!data.model?.trim()) throw new Error('model is required');
  validateVehicleFields(data);

  return prisma.vehicle.create({ data });
}

export async function updateVehicle(id: number, data: Partial<{
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}>) {
  validateVehicleFields(data);

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error('Vehicle not found');

  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: number) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error('Vehicle not found');
  return prisma.vehicle.delete({ where: { id } });
}

export async function purchaseVehicle(id: number) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error('Vehicle not found');
  if (vehicle.quantity === 0) throw new Error('Out of stock');

  // Atomic decrement — only succeeds if quantity > 0
  return prisma.vehicle.update({
    where: { id, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });
}

export async function restockVehicle(id: number, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('amount must be a positive integer');
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new Error('Vehicle not found');

  return prisma.vehicle.update({ where: { id }, data: { quantity: { increment: amount } } });
}
