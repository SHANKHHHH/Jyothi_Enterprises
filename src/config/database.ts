import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client optimized for Supabase (with fresh connections)
const createPrismaClient = () => new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'], // Reduced logging
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Use global instance in development, fresh in production
const prisma = global.prisma || createPrismaClient();

// For development hot reload only
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;