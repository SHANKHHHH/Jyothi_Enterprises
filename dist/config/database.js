"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
const client_1 = require("@prisma/client");
class DatabaseManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.isConnected = false;
        this.connectionPromise = null;
        this.prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = this._connect();
        return this.connectionPromise;
    }
    async _connect() {
        try {
            await this.prisma.$connect();
            this.isConnected = true;
            this.retryCount = 0;
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`);
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this._connect();
            }
            else {
                console.error('Max retry attempts reached. Database connection failed.');
                throw error;
            }
        }
        finally {
            this.connectionPromise = null;
        }
    }
    getClient() {
        return this.prisma;
    }
    async disconnect() {
        try {
            if (this.isConnected) {
                await this.prisma.$disconnect();
                this.isConnected = false;
                console.log('Database disconnected gracefully');
            }
        }
        catch (error) {
            console.error('Error disconnecting database:', error);
        }
    }
    isConnectedToDb() {
        return this.isConnected;
    }
    // Method to reset connection (useful for handling prepared statement errors)
    async resetConnection() {
        try {
            console.log('Resetting database connection...');
            await this.disconnect();
            this.retryCount = 0;
            // Create a new Prisma client instance to clear any prepared statements
            this.prisma = new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL,
                    },
                },
            });
            await this.connect();
            console.log('Database connection reset successfully');
        }
        catch (error) {
            console.error('Failed to reset database connection:', error);
            throw error;
        }
    }
    // Periodic health check to prevent connection issues
    startHealthCheck() {
        setInterval(async () => {
            try {
                if (this.isConnected) {
                    await this.prisma.$queryRaw `SELECT 1`;
                }
            }
            catch (error) {
                console.log('Health check failed, attempting to reconnect...');
                try {
                    await this.resetConnection();
                }
                catch (resetError) {
                    console.error('Failed to reconnect during health check:', resetError);
                }
            }
        }, 30000); // Check every 30 seconds
    }
}
// Initialize database manager as singleton
const dbManager = DatabaseManager.getInstance();
exports.dbManager = dbManager;
// Set global instance for development hot reload
if (process.env.NODE_ENV !== 'production') {
    global.prisma = dbManager.getClient();
}
// Connect to database
dbManager.connect().catch(error => {
    console.error('Failed to connect to database:', error);
});
// Start periodic health check after initial connection
setTimeout(() => {
    dbManager.startHealthCheck();
}, 5000); // Start health check 5 seconds after initialization
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
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await dbManager.disconnect();
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await dbManager.disconnect();
    process.exit(1);
});
// Export the prisma client - guaranteed to be available and properly typed
const prisma = dbManager.getClient();
// Ensure prisma is never undefined
if (!prisma) {
    throw new Error('Prisma client failed to initialize');
}
exports.default = prisma;
