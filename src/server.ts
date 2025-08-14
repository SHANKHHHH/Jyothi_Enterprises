// Import preload-env first to load and validate environment variables
import './preload-env';
import { env } from './preload-env';

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contact';
import bookingRoutes from './routes/booking';
import cartRoutes from './routes/cart';
import prisma from './config/database';
import { dbErrorHandler } from './middleware/dbErrorHandler';

const app: Application = express();
const PORT = env.PORT;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    if (!prisma) {
      throw new Error('Database client not initialized');
    }
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test if we can query the database (without assuming specific table names)
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

// Test endpoint for debugging
app.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL ? 'Set' : 'Not set',
    jwtSecret: env.JWT_SECRET ? 'Set' : 'Not set'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', bookingRoutes);
app.use('/api', cartRoutes);

// Database error handler middleware (should be before 404 handler)
app.use(dbErrorHandler);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Database health: http://localhost:${PORT}/health/db`);
  console.log(` Test endpoint: http://localhost:${PORT}/test`);
  console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(` Contact endpoints: http://localhost:${PORT}/api/contact`);
  console.log(` Booking endpoints: http://localhost:${PORT}/api/services, /api/events, /api/bookings`);
  console.log(` Cart endpoints: http://localhost:${PORT}/api/cart, /api/checkout, /api/orders`);
});

export default app; 