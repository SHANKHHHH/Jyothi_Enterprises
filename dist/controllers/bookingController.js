"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooking = exports.getAllBookings = exports.createBooking = exports.addEventType = exports.getEventTypes = exports.getServices = exports.bookingValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = __importDefault(require("../services/emailService"));
// Validation rules for booking submission
exports.bookingValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('mobile')
        .trim()
        .matches(/^(\+91\s?)?[0-9]{10}$/)
        .withMessage('Please enter a valid Indian mobile number'),
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('gst')
        .optional()
        .trim()
        .isLength({ min: 15, max: 15 })
        .withMessage('GST number must be 15 characters'),
    (0, express_validator_1.body)('paxCount')
        .isInt({ min: 1 })
        .withMessage('Pax count must be a positive number'),
    (0, express_validator_1.body)('attendants')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Attendants must be a non-negative number'),
    (0, express_validator_1.body)('toilets')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Toilets must be a non-negative number'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Location must be between 1 and 200 characters'),
    (0, express_validator_1.body)('startDate')
        .isISO8601()
        .withMessage('Please enter a valid start date'),
    (0, express_validator_1.body)('endDate')
        .isISO8601()
        .withMessage('Please enter a valid end date'),
    (0, express_validator_1.body)('startTime')
        .optional()
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please enter a valid start time (HH:MM format)'),
    (0, express_validator_1.body)('endTime')
        .optional()
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please enter a valid end time (HH:MM format)'),
    (0, express_validator_1.body)('serviceIds')
        .isArray({ min: 1 })
        .withMessage('At least one service must be selected'),
    (0, express_validator_1.body)('serviceIds.*')
        .isUUID()
        .withMessage('Invalid service ID format'),
    (0, express_validator_1.body)('eventTypeIds')
        .isArray({ min: 1 })
        .withMessage('At least one event type must be selected'),
    (0, express_validator_1.body)('eventTypeIds.*')
        .isUUID()
        .withMessage('Invalid event type ID format'),
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
// Add a new event type (open to all users)
const addEventType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Event type name must be between 2 and 100 characters',
            });
        }
        // Check if event type already exists
        const existing = await database_1.default.eventType.findFirst({ where: { name: name.trim() } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Event type already exists',
            });
        }
        const eventType = await database_1.default.eventType.create({ data: { name: name.trim() } });
        return res.status(201).json({
            success: true,
            message: 'Event type added successfully',
            data: eventType,
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
const createBooking = async (req, res) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { name, mobile, email, gst, paxCount, attendants, toilets, location, startDate, endDate, startTime, endTime, serviceIds, eventTypeIds, } = req.body;
        // Create the booking with relations
        const booking = await database_1.default.booking.create({
            data: {
                name,
                mobile,
                email,
                gst,
                paxCount,
                attendants,
                toilets,
                location,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime,
                endTime,
                services: {
                    create: serviceIds.map((serviceId) => ({
                        service: { connect: { id: serviceId } },
                    })),
                },
                events: {
                    create: eventTypeIds.map((eventTypeId) => ({
                        eventType: { connect: { id: eventTypeId } },
                    })),
                },
            },
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
        // Send email notification to admins
        await emailService_1.default.sendBookingNotificationToAdmins({
            id: booking.id,
            name: booking.name,
            mobile: booking.mobile,
            email: booking.email,
            gst: booking.gst || undefined,
            paxCount: booking.paxCount,
            attendants: booking.attendants || undefined,
            toilets: booking.toilets || undefined,
            location: booking.location || undefined,
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime || undefined,
            endTime: booking.endTime || undefined,
            createdAt: booking.createdAt,
            services: booking.services,
            events: booking.events,
        });
        // Send confirmation email to user
        await emailService_1.default.sendBookingConfirmationToUser(booking.email, {
            ...booking,
            gst: booking.gst ?? undefined,
            attendants: booking.attendants ?? undefined,
            toilets: booking.toilets ?? undefined,
            location: booking.location ?? undefined,
            startTime: booking.startTime ?? undefined,
            endTime: booking.endTime ?? undefined,
        });
        return res.status(201).json({
            success: true,
            message: 'Booking submitted successfully! We will contact you soon.',
            data: {
                bookingId: booking.id,
                submittedAt: booking.createdAt,
                customerName: booking.name,
            },
        });
    }
    catch (error) {
        console.error('Booking submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit booking. Please try again later.',
        });
    }
};
exports.createBooking = createBooking;
// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
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
exports.getAllBookings = getAllBookings;
// Get a single booking (admin only)
const getBooking = async (req, res) => {
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
exports.getBooking = getBooking;