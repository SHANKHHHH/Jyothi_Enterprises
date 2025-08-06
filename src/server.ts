// Import preload-env first to load and validate environment variables
import './preload-env';
import { env } from './preload-env';

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contact';
import bookingRoutes from './routes/booking';
import cartRoutes from './routes/cart';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', bookingRoutes);
app.use('/api', cartRoutes);

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
  console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(` Contact endpoints: http://localhost:${PORT}/api/contact`);
  console.log(` Booking endpoints: http://localhost:${PORT}/api/services, /api/events, /api/bookings`);
  console.log(` Cart endpoints: http://localhost:${PORT}/api/cart, /api/checkout, /api/orders`);
});

export default app; 