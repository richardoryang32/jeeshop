import { PrismaClient } from '@prisma/client';

let prisma;

try {
  if (process.env.NODE_ENV === 'production') {
    // Production: use Neon adapter
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const { neonConfig } = require('@neondatabase/serverless');
    const ws = require('ws');

    neonConfig.webSocketConstructor = ws;
    neonConfig.poolQueryViaFetch = true;

    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });
    prisma = new PrismaClient({ adapter });
  } else {
    // Development: direct PostgreSQL connection
    prisma = new PrismaClient();
  }
} catch (error) {
  console.error('Error initializing Prisma:', error);
  prisma = new PrismaClient();
}

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;