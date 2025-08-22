"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const services_1 = __importDefault(require("./services"));
const events_1 = __importDefault(require("./events"));
const products_1 = __importDefault(require("./products"));
const booking_1 = __importDefault(require("./booking"));
const cart_1 = __importDefault(require("./cart"));
const contact_1 = __importDefault(require("./contact"));
const router = express_1.default.Router();
// Mount all route modules
router.use('/auth', auth_1.default);
router.use('/services', services_1.default);
router.use('/events', events_1.default);
router.use('/products', products_1.default);
router.use('/booking', booking_1.default);
router.use('/cart', cart_1.default);
router.use('/contact', contact_1.default);
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
exports.default = router;
