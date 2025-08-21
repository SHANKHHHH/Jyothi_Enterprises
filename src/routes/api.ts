import express from 'express';
import authRoutes from './auth';
import servicesRoutes from './services';
import eventsRoutes from './events';
import productsRoutes from './products';
import bookingRoutes from './booking';
import cartRoutes from './cart';
import contactRoutes from './contact';

const router = express.Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/services', servicesRoutes);
router.use('/events', eventsRoutes);
router.use('/products', productsRoutes);
router.use('/booking', bookingRoutes);
router.use('/cart', cartRoutes);
router.use('/contact', contactRoutes);

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
          endpoints: {
        auth: '/api/auth',
        services: '/api/services',
        events: '/api/events',
        products: '/api/products',
        booking: '/api/booking',
        cart: '/api/cart',
        contact: '/api/contact'
      }
  });
});

// API documentation
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jyoti Enterprises API',
    version: '1.0.0',
    description: 'Complete API for event booking, services, and cart management',
    documentation: {
      auth: {
        'POST /login': 'User authentication',
        'GET /profile': 'Get user profile'
      },
      services: {
        'GET /': 'Get all services',
        'GET /:id': 'Get specific service',
        'POST /': 'Create new service (protected)',
        'PUT /:id': 'Update service (protected)',
        'DELETE /:id': 'Delete service (protected)',
        'GET /popular': 'Get popular services'
      },
      events: {
        'GET /': 'Get all event types',
        'GET /:id': 'Get specific event type',
        'POST /': 'Create new event type (protected)',
        'PUT /:id': 'Update event type (protected)',
        'DELETE /:id': 'Delete event type (protected)',
        'GET /popular': 'Get popular events',
        'GET /search': 'Search events'
      },
      products: {
        'GET /': 'Get all products (basic data for cart)',
        'GET /:id': 'Get specific product (basic data)',
        'POST /': 'Create new product (protected)'
      },
      booking: {
        'POST /': 'Submit new booking',
        'GET /': 'Get all bookings (admin)',
        'GET /:id': 'Get specific booking'
      },
      cart: {
        'GET /': 'Get cart contents',
        'POST /items': 'Add item to cart',
        'PUT /items/:id': 'Update cart item',
        'DELETE /items/:id': 'Remove item from cart',
        'POST /checkout': 'Process checkout'
      },
      contact: {
        'POST /submit': 'Submit contact form',
        'POST /introduce-yourself': 'Introduce yourself form'
      }
    }
  });
});

export default router;
