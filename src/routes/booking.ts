import express from 'express';
import {
  getServices,
  getEventTypes,
  submitBooking,
  getBookings,
  getBookingById,
  validateBooking,
  addEventType,
} from '../controllers/bookingController';

const router = express.Router();

// Get all services
router.get('/services', getServices);

// Get all event types
router.get('/events', getEventTypes);
// Add a new event type (open to all users)
router.post('/events', addEventType);

// Submit a new booking
router.post('/bookings', validateBooking, submitBooking);

// Get all bookings (admin only)
router.get('/bookings', getBookings);

// Get a single booking (admin only)
router.get('/bookings/:id', getBookingById);

export default router; 