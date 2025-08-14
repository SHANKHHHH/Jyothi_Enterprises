"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import preload-env first to load and validate environment variables
require("./preload-env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const cart_1 = __importDefault(require("./routes/cart"));
const booking_1 = __importDefault(require("./routes/booking"));
const contact_1 = __importDefault(require("./routes/contact"));
const database_1 = __importDefault(require("./config/database"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/booking', booking_1.default);
app.use('/api/contact', contact_1.default);
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Database health: http://localhost:${PORT}/health/db`);
    console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
});
