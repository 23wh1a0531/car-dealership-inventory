import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './client';

async function seed() {
  const passwordHash = await bcrypt.hash('admin1234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@dealership.com' },
    update: {},
    create: { email: 'admin@dealership.com', passwordHash, role: 'ADMIN' },
  });

  console.log('Seeded admin user: admin@dealership.com / admin1234');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
