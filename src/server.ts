// Import preload-env first to load and validate environment variables
import './preload-env';
import { env } from './preload-env';

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import prisma from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount unified API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    if (!prisma) {
      throw new Error('Database client not initialized');
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Test if we can query the database
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    res.json({
      status: 'OK',
      message: 'Database connected successfully',
      database: {
        connected: true,
        tableCount: Array.isArray(tables) ? tables.length : 'Unknown',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to display environment variables and server status
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set'
  });
});
  
// Start server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Database health: http://localhost:${PORT}/health/db`);
  console.log(` Test endpoint: http://localhost:${PORT}/test`);
}); 