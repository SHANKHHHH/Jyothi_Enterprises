"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
const client_1 = require("@prisma/client");
// Simple database manager with proper error handling
class DatabaseManager {
    constructor() {
        this.isConnected = false;
        this.connectionPool = [];
        this.maxPoolSize = 3;
        this.currentPoolIndex = 0;
        // Create initial connection with prepared statements disabled
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        const dbUrlWithParams = dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'prepared_statements=false';
        this.prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            datasources: {
                db: {
                    url: dbUrlWithParams,
                },
            },
        });
        // Initialize connection pool
        this.initializeConnectionPool();
    }
    async initializeConnectionPool() {
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error('DATABASE_URL environment variable is required');
            }
            const dbUrlWithParams = dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'prepared_statements=false';
            // Create additional connections for the pool
            for (let i = 0; i < this.maxPoolSize - 1; i++) {
                const client = new client_1.PrismaClient({
                    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
                    datasources: {
                        db: {
                            url: dbUrlWithParams,
                        },
                    },
                });
                await client.$connect();
                this.connectionPool.push(client);
            }
            console.log(`✅ Connection pool initialized with ${this.connectionPool.length + 1} connections (prepared statements disabled)`);
        }
        catch (error) {
            console.warn('⚠️ Failed to initialize connection pool, using single connection');
        }
    }
    async connect() {
        try {
            await this.prisma.$connect();
            this.isConnected = true;
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    getClient() {
        // Round-robin connection selection
        if (this.connectionPool.length > 0) {
            this.currentPoolIndex = (this.currentPoolIndex + 1) % (this.connectionPool.length + 1);
            if (this.currentPoolIndex === 0) {
                return this.prisma;
            }
            else {
                return this.connectionPool[this.currentPoolIndex - 1];
            }
        }
        return this.prisma;
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.isConnected = false;
            console.log('Database disconnected gracefully');
            // Disconnect connection pool
            for (const client of this.connectionPool) {
                try {
                    await client.$disconnect();
                }
                catch (error) {
                    console.warn('Failed to disconnect pool client:', error);
                }
            }
            this.connectionPool = [];
            this.currentPoolIndex = 0;
        }
        catch (error) {
            console.error('Error disconnecting database:', error);
        }
    }
    // Method that executes queries (prepared statements are disabled)
    async executeQuery(operation) {
        try {
            return await operation();
        }
        catch (error) {
            // Log any errors for debugging
            console.error('Database operation failed:', error);
            throw error;
        }
    }
    // Reset connection to clear prepared statements
    async resetConnection() {
        try {
            console.log('Resetting database connection...');
            // Disconnect main connection
            await this.disconnect();
            // Disconnect and clear connection pool
            for (const client of this.connectionPool) {
                try {
                    await client.$disconnect();
                }
                catch (error) {
                    console.warn('Failed to disconnect pool client:', error);
                }
            }
            this.connectionPool = [];
            this.currentPoolIndex = 0;
            // Create a completely new Prisma client
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error('DATABASE_URL environment variable is required');
            }
            const dbUrlWithParams = dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'prepared_statements=false';
            this.prisma = new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
                datasources: {
                    db: {
                        url: dbUrlWithParams,
                    },
                },
            });
            await this.connect();
            // Reinitialize connection pool
            await this.initializeConnectionPool();
            console.log('Database connection reset successfully');
        }
        catch (error) {
            console.error('Failed to reset database connection:', error);
            throw error;
        }
    }
}
// Initialize database manager
const dbManager = new DatabaseManager();
exports.dbManager = dbManager;
// Set global instance for development hot reload
if (process.env.NODE_ENV !== 'production') {
    global.prisma = dbManager.getClient();
}
// Connect to database
dbManager.connect().catch(error => {
    console.error('Failed to connect to database:', error);
});
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await dbManager.disconnect();
});
process.on('SIGINT', async () => {
    await dbManager.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await dbManager.disconnect();
    process.exit(0);
});
// Export the prisma client
const prisma = dbManager.getClient();
exports.default = prisma;
