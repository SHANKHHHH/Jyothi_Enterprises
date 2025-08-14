"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Simple Prisma client with multiple approaches to disable prepared statements
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL + '?prepared_statements=false&statement_cache_mode=0&disable_prepared_statements=true&prepared_statement_cache_size=0&binary_parameters=yes',
        },
    },
});
// For development hot reload
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
