import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Simple database manager with proper error handling
class DatabaseManager {
  private prisma: PrismaClient;
  private isConnected = false;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('Database disconnected gracefully');
    } catch (error) {
      console.error('Error disconnecting database:', error);
    }
  }

  // Method that actually fixes the prepared statement error
  async executeQuery<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Check if this is a prepared statement error
      if (error?.message?.includes('prepared statement') || 
          error?.code === '42P05' ||
          error?.message?.includes('already exists')) {
        
        console.log('Prepared statement error detected, resetting connection...');
        
        // Reset the connection
        await this.resetConnection();
        
        // Retry the operation
        return await operation();
      } else {
        throw error;
      }
    }
  }

  // Reset connection to clear prepared statements
  async resetConnection() {
    try {
      console.log('Resetting database connection...');
      await this.disconnect();
      
      // Create a completely new Prisma client
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      
      await this.connect();
      console.log('Database connection reset successfully');
    } catch (error) {
      console.error('Failed to reset database connection:', error);
      throw error;
    }
  }
}

// Initialize database manager
const dbManager = new DatabaseManager();

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
const prisma: PrismaClient = dbManager.getClient();

export default prisma;
export { dbManager };