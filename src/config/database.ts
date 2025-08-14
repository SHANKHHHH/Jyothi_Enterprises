import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

class DatabaseManager {
  private prisma: PrismaClient;
  private retryCount = 0;
  private maxRetries = 3;
  private isConnected = false;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      this.retryCount = 0;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.connect(), 5000);
      } else {
        console.error('Max retry attempts reached. Database connection failed.');
      }
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.prisma.$disconnect();
        this.isConnected = false;
        console.log('Database disconnected gracefully');
      }
    } catch (error) {
      console.error('Error disconnecting database:', error);
    }
  }

  isConnectedToDb() {
    return this.isConnected;
  }
}

// Initialize database manager
const dbManager = new DatabaseManager();

// Set global instance for development hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = dbManager.getClient();
}

// Connect to database
dbManager.connect();

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
const prisma: PrismaClient = dbManager.getClient();

// Ensure prisma is never undefined
if (!prisma) {
  throw new Error('Prisma client failed to initialize');
}

export default prisma;