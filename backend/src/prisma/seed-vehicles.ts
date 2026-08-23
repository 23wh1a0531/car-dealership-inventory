import 'dotenv/config';
import prisma from './client';

const vehicles = [
  { make: 'Mercedes-Benz', model: 'C-Class', category: 'SEDAN', price: 52000, quantity: 3 },
  { make: 'Audi', model: 'Q5', category: 'SUV', price: 48000, quantity: 4 },
  { make: 'Tesla', model: 'Model 3', category: 'SEDAN', price: 42000, quantity: 6 },
  { make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 41000, quantity: 2 },
  { make: 'Chevrolet', model: 'Silverado', category: 'TRUCK', price: 46000, quantity: 7 },
  { make: 'Hyundai', model: 'i20', category: 'HATCHBACK', price: 18000, quantity: 8 },
  { make: 'Porsche', model: '911', category: 'COUPE', price: 115000, quantity: 1 },
  { make: 'Toyota', model: 'Hilux', category: 'TRUCK', price: 35000, quantity: 5 },
  { make: 'Kia', model: 'Sportage', category: 'SUV', price: 29000, quantity: 4 },
  { make: 'BMW', model: '5 Series', category: 'SEDAN', price: 58000, quantity: 2 },
];

async function seedVehicles() {
  await prisma.vehicle.createMany({ data: vehicles });
  console.log(`Inserted ${vehicles.length} vehicles.`);
  await prisma.$disconnect();
}

seedVehicles().catch((e) => {
  console.error(e);
  process.exit(1);
});
