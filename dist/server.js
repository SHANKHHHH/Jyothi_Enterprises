"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import preload-env first to load and validate environment variables
require("./preload-env");
const preload_env_1 = require("./preload-env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const contact_1 = __importDefault(require("./routes/contact"));
const booking_1 = __importDefault(require("./routes/booking"));
const cart_1 = __importDefault(require("./routes/cart"));
const database_1 = __importDefault(require("./config/database"));
const dbErrorHandler_1 = require("./middleware/dbErrorHandler");
const app = (0, express_1.default)();
const PORT = preload_env_1.env.PORT;
// Enable CORS for all origins
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// Database health check endpoint
app.get('/health/db', async (req, res) => {
    try {
        if (!database_1.default) {
            throw new Error('Database client not initialized');
        }
        // Test database connection
        await database_1.default.$queryRaw `SELECT 1`;
        // Test if we can query the database (without assuming specific table names)
        const tables = await database_1.default.$queryRaw `
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
    }
    catch (error) {
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
app.get('/test', (req, res) => {
    res.json({
        message: 'Test endpoint working',
        timestamp: new Date().toISOString(),
        environment: preload_env_1.env.NODE_ENV,
        databaseUrl: preload_env_1.env.DATABASE_URL ? 'Set' : 'Not set',
        jwtSecret: preload_env_1.env.JWT_SECRET ? 'Set' : 'Not set'
    });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api', booking_1.default);
app.use('/api', cart_1.default);
// Database error handler middleware (should be before 404 handler)
app.use(dbErrorHandler_1.dbErrorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Environment: ${preload_env_1.env.NODE_ENV}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Database health: http://localhost:${PORT}/health/db`);
    console.log(` Test endpoint: http://localhost:${PORT}/test`);
    console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(` Contact endpoints: http://localhost:${PORT}/api/contact`);
    console.log(` Booking endpoints: http://localhost:${PORT}/api/services, /api/events, /api/bookings`);
    console.log(` Cart endpoints: http://localhost:${PORT}/api/cart, /api/checkout, /api/orders`);
});
exports.default = app;
