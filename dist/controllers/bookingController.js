"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.getBookings = exports.submitBooking = exports.addEventType = exports.getEventTypes = exports.getServices = exports.validateService = exports.validateEventType = exports.validateBooking = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = __importDefault(require("../services/emailService"));
// Validation rules
exports.validateBooking = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    (0, express_validator_1.body)('mobile').isMobilePhone('any').withMessage('Please provide a valid mobile number'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('paxCount').isInt({ min: 1 }).withMessage('Pax count must be at least 1'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Please provide a valid start date'),
    (0, express_validator_1.body)('endDate').isISO8601().withMessage('Please provide a valid end date'),
    (0, express_validator_1.body)('startTime').optional().isString().withMessage('Start time must be a string'),
    (0, express_validator_1.body)('endTime').optional().isString().withMessage('End time must be a string'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string'),
    (0, express_validator_1.body)('gst').optional().isString().withMessage('GST must be a string'),
    (0, express_validator_1.body)('attendants').optional().isInt({ min: 0 }).withMessage('Attendants must be a non-negative integer'),
    (0, express_validator_1.body)('toilets').optional().isInt({ min: 0 }).withMessage('Toilets must be a non-negative integer'),
    (0, express_validator_1.body)('services').optional().isArray().withMessage('Services must be an array'),
    (0, express_validator_1.body)('events').optional().isArray().withMessage('Events must be an array'),
];
exports.validateEventType = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Event type name must be at least 2 characters long'),
];
exports.validateService = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Service name must be at least 2 characters long'),
];
// Get all services
const getServices = async (req, res) => {
    try {
        const services = await database_1.default.service.findMany({
            orderBy: { name: 'asc' },
        });
        return res.status(200).json({
            success: true,
            data: services,
        });
    }
    catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
        });
    }
};
exports.getServices = getServices;
// Get all event types
const getEventTypes = async (req, res) => {
    try {
        const eventTypes = await database_1.default.eventType.findMany({
            orderBy: { name: 'asc' },
        });
        return res.status(200).json({
            success: true,
            data: eventTypes,
        });
    }
    catch (error) {
        console.error('Error fetching event types:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event types',
        });
    }
};
exports.getEventTypes = getEventTypes;
// Add new event type
const addEventType = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { name } = req.body;
        // Check if event type already exists
        const existing = await database_1.default.eventType.findFirst({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Event type with this name already exists',
            });
        }
        const eventType = await database_1.default.eventType.create({ data: { name: name.trim() } });
        return res.status(201).json({
            success: true,
            data: eventType,
            message: 'Event type added successfully',
        });
    }
    catch (error) {
        console.error('Error adding event type:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add event type',
        });
    }
};
exports.addEventType = addEventType;
// Submit a new booking
const submitBooking = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { name, mobile, email, gst, paxCount, attendants, toilets, location, startDate, endDate, startTime, endTime, services, events, } = req.body;
        // Create the booking
        const booking = await database_1.default.booking.create({
            data: {
                name: name.trim(),
                mobile: mobile.trim(),
                email: email.trim(),
                gst: gst?.trim(),
                paxCount: parseInt(paxCount),
                attendants: attendants ? parseInt(attendants) : null,
                toilets: toilets ? parseInt(toilets) : null,
                location: location?.trim(),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime: startTime?.trim(),
                endTime: endTime?.trim(),
            },
        });
        // Add services if provided
        if (services && Array.isArray(services) && services.length > 0) {
            const serviceConnections = services.map((serviceId) => ({
                bookingId: booking.id,
                serviceId: serviceId,
            }));
            await database_1.default.bookingService.createMany({
                data: serviceConnections,
            });
        }
        // Add events if provided
        if (events && Array.isArray(events) && events.length > 0) {
            const eventConnections = events.map((eventTypeId) => ({
                bookingId: booking.id,
                eventTypeId: eventTypeId,
            }));
            await database_1.default.bookingEvent.createMany({
                data: eventConnections,
            });
        }
        // Fetch the complete booking with relations for email
        const bookingWithRelations = await database_1.default.booking.findUnique({
            where: { id: booking.id },
            include: {
                services: {
                    include: {
                        service: true,
                    },
                },
                events: {
                    include: {
                        eventType: true,
                    },
                },
            },
        });
        // Send email notification
        let emailSent = false;
        if (bookingWithRelations) {
            // Convert null values to undefined to match BookingData interface
            const bookingForEmail = {
                ...bookingWithRelations,
                gst: bookingWithRelations.gst || undefined,
                attendants: bookingWithRelations.attendants || undefined,
                toilets: bookingWithRelations.toilets || undefined,
                location: bookingWithRelations.location || undefined,
                startTime: bookingWithRelations.startTime || undefined,
                endTime: bookingWithRelations.endTime || undefined,
            };
            emailSent = await emailService_1.default.sendBookingNotificationToAdmins(bookingForEmail);
        }
        return res.status(201).json({
            success: true,
            message: 'Booking submitted successfully',
            data: {
                booking: bookingWithRelations,
                emailSent,
            },
        });
    }
    catch (error) {
        console.error('Error submitting booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit booking',
        });
    }
};
exports.submitBooking = submitBooking;
// Get all bookings
const getBookings = async (req, res) => {
    try {
        const bookings = await database_1.default.booking.findMany({
            include: {
                services: {
                    include: {
                        service: true,
                    },
                },
                events: {
                    include: {
                        eventType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({
            success: true,
            data: bookings,
        });
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
        });
    }
};
exports.getBookings = getBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await database_1.default.booking.findUnique({
            where: { id },
            include: {
                services: {
                    include: {
                        service: true,
                    },
                },
                events: {
                    include: {
                        eventType: true,
                    },
                },
            },
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
        });
    }
};
exports.getBookingById = getBookingById;
