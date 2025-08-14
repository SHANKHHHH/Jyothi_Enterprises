"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithRetry = void 0;
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
// Simple retry function for prepared statement errors
const executeWithRetry = async (operation) => {
    try {
        return await operation();
    }
    catch (error) {
        // If it's a prepared statement error, retry once
        if (error?.message?.includes('prepared statement') || error?.code === '42P05') {
            console.log('Prepared statement error detected, retrying once...');
            return await operation();
        }
        throw error;
    }
};
exports.executeWithRetry = executeWithRetry;
exports.default = prisma;
