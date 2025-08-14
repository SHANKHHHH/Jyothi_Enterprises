"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
exports.default = prisma;