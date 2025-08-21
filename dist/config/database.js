"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithRetry = void 0;
const client_1 = require("@prisma/client");
// Create Prisma client
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : process.env.DATABASE_URL,
        },
    },
});
// For development hot reload
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
// Robust retry function that handles prepared statement errors
const executeWithRetry = async (operation, maxRetries = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            // Check if this is a prepared statement error
            if (error?.message?.includes('prepared statement') ||
                error?.code === '42P05' ||
                error?.meta?.code === '42P05' ||
                error?.message?.includes('already exists')) {
                console.log(`Prepared statement error detected (attempt ${attempt}/${maxRetries}), retrying...`);
                if (attempt < maxRetries) {
                    // Wait a bit before retry
                    await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                    continue;
                }
            }
            // If not a prepared statement error or max retries reached, throw the error
            throw error;
        }
    }
    // If we get here, all retries failed
    throw lastError;
};
exports.executeWithRetry = executeWithRetry;
exports.default = prisma;
