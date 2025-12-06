import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // Production: Neon serverless adapter
  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { neonConfig } = await import("@neondatabase/serverless");
  const ws = (await import("ws")).default;

  neonConfig.webSocketConstructor = ws;
  neonConfig.poolQueryViaFetch = true;

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  prisma = new PrismaClient({ adapter });
} else {
  // Development: normal connection
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
