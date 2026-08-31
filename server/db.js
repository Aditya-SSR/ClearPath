const { PrismaClient } = require(`@prisma/client`);

// Singleton PrismaClient instance.
// In development, nodemon restarts would otherwise open a new connection pool on
// every reload — caching on globalThis reuses a single instance across restarts.
const prisma = globalThis.__clearPathPrisma || new PrismaClient();

if (process.env.NODE_ENV !== `production`) {
    globalThis.__clearPathPrisma = prisma;
}

module.exports = prisma;