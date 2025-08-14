"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const router = express_1.default.Router();
// Get all services
router.get('/services', bookingController_1.getServices);
// Get all event types
router.get('/events', bookingController_1.getEventTypes);
// Add a new event type (open to all users)
router.post('/events', bookingController_1.addEventType);
// Submit a new booking
router.post('/bookings', bookingController_1.bookingValidation, bookingController_1.submitBooking);
// Get all bookings (admin only)
router.get('/bookings', bookingController_1.getAllBookings);
// Get a single booking (admin only)
router.get('/bookings/:id', bookingController_1.getBooking);
exports.default = router;
