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
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api', booking_1.default);
app.use('/api', cart_1.default);
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
    console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(` Contact endpoints: http://localhost:${PORT}/api/contact`);
    console.log(` Booking endpoints: http://localhost:${PORT}/api/services, /api/events, /api/bookings`);
    console.log(` Cart endpoints: http://localhost:${PORT}/api/cart, /api/checkout, /api/orders`);
});
exports.default = app;