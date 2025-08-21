import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// GET /api/events - Get all event types from database
router.get('/', async (req, res) => {
  try {
    const events = await prisma.eventType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Events fetched successfully',
      count: events.length,
      events: events,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// GET /api/events/:id - Get specific event type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.eventType.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            booking: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                location: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: `Event with ID ${id} does not exist`
      });
    }

    res.json({
      success: true,
      message: 'Event fetched successfully',
      event: event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// POST /api/events - Create new event type (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Event name is required and must be a non-empty string'
      });
    }

    const existingEvent = await prisma.eventType.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingEvent) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate event',
        message: 'An event type with this name already exists'
      });
    }

    const newEvent = await prisma.eventType.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Event type created successfully',
      event: newEvent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// PUT /api/events/:id - Update event type (protected route)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Event name is required and must be a non-empty string'
      });
    }

    const existingEvent = await prisma.eventType.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: `Event with ID ${id} does not exist`
      });
    }

    const updatedEvent = await prisma.eventType.update({
      where: { id },
      data: {
        name: name.trim()
      }
    });

    res.json({
      success: true,
      message: 'Event type updated successfully',
      event: updatedEvent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// DELETE /api/events/:id - Delete event type (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.eventType.findUnique({
      where: { id },
      include: {
        bookings: true
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: `Event with ID ${id} does not exist`
      });
    }

    // Check if event is being used in any bookings
    if (existingEvent.bookings.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete event',
        message: 'This event type is being used in existing bookings and cannot be deleted'
      });
    }

    await prisma.eventType.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event type deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// GET /api/events/popular - Get popular event types (most booked)
router.get('/popular', async (req, res) => {
  try {
    const popularEvents = await prisma.eventType.findMany({
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json({
      success: true,
      message: 'Popular events fetched successfully',
      count: popularEvents.length,
      events: popularEvents.map(event => ({
        id: event.id,
        name: event.name,
        bookingCount: event._count.bookings
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching popular events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular events',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

// GET /api/events/search?q=query - Search events by name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
        message: 'Please provide a search query'
      });
    }

    const searchResults = await prisma.eventType.findMany({
      where: {
        name: {
          contains: q.trim(),
          mode: 'insensitive'
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Search completed successfully',
      query: q.trim(),
      count: searchResults.length,
      events: searchResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search events',
      message: error instanceof Error ? error.message : 'Database error occurred'
    });
  }
});

export default router;
