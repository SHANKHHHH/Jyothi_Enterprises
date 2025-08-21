import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import emailService from '../services/emailService';

// Validation rules
export const validateBooking = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('mobile').isMobilePhone('any').withMessage('Please provide a valid mobile number'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('paxCount').isInt({ min: 1 }).withMessage('Pax count must be at least 1'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('endDate').isISO8601().withMessage('Please provide a valid end date'),
  body('startTime').optional().isString().withMessage('Start time must be a string'),
  body('endTime').optional().isString().withMessage('End time must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('gst').optional().isString().withMessage('GST must be a string'),
  body('attendants').optional().isInt({ min: 0 }).withMessage('Attendants must be a non-negative integer'),
  body('toilets').optional().isInt({ min: 0 }).withMessage('Toilets must be a non-negative integer'),
  body('services').optional().isArray().withMessage('Services must be an array'),
  body('events').optional().isArray().withMessage('Events must be an array'),
];

export const validateEventType = [
  body('name').trim().isLength({ min: 2 }).withMessage('Event type name must be at least 2 characters long'),
];

export const validateService = [
  body('name').trim().isLength({ min: 2 }).withMessage('Service name must be at least 2 characters long'),
];

// Get all services
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
    });
  }
};

// Get all event types
export const getEventTypes = async (req: Request, res: Response) => {
  try {
    const eventTypes = await prisma.eventType.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: eventTypes,
    });
  } catch (error) {
    console.error('Error fetching event types:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event types',
    });
  }
};

// Add new event type
export const addEventType = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name } = req.body;

    // Check if event type already exists
    const existing = await prisma.eventType.findFirst({ where: { name: name.trim() } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Event type with this name already exists',
      });
    }

    const eventType = await prisma.eventType.create({ data: { name: name.trim() } });

    return res.status(201).json({
      success: true,
      data: eventType,
      message: 'Event type added successfully',
    });
  } catch (error) {
    console.error('Error adding event type:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add event type',
    });
  }
};

// Submit a new booking
export const submitBooking = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      mobile,
      email,
      gst,
      paxCount,
      attendants,
      toilets,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      services,
      events,
    } = req.body;

    // Create the booking
    const booking = await prisma.booking.create({
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
      const serviceConnections = services.map((serviceId: string) => ({
        bookingId: booking.id,
        serviceId: serviceId,
      }));

      await prisma.bookingService.createMany({
        data: serviceConnections,
      });
    }

    // Add events if provided
    if (events && Array.isArray(events) && events.length > 0) {
      const eventConnections = events.map((eventTypeId: string) => ({
        bookingId: booking.id,
        eventTypeId: eventTypeId,
      }));

      await prisma.bookingEvent.createMany({
        data: eventConnections,
      });
    }

    // Fetch the complete booking with relations for email
    const bookingWithRelations = await prisma.booking.findUnique({
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
      emailSent = await emailService.sendBookingNotificationToAdmins(bookingForEmail);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      data: {
        booking: bookingWithRelations,
        emailSent,
      },
    });
  } catch (error) {
    console.error('Error submitting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit booking',
    });
  }
};

// Get all bookings
export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
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
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
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
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
    });
  }
}; 