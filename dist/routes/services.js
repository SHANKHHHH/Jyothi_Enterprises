"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// GET /api/services - Get all services from database
router.get('/', async (req, res) => {
    try {
        const services = await database_1.default.service.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json({
            success: true,
            message: 'Services fetched successfully',
            count: services.length,
            services: services,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// GET /api/services/:id - Get specific service by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await database_1.default.service.findUnique({
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
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found',
                message: `Service with ID ${id} does not exist`
            });
        }
        res.json({
            success: true,
            message: 'Service fetched successfully',
            service: service,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch service',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// POST /api/services - Create new service (protected route)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Service name is required and must be a non-empty string'
            });
        }
        const existingService = await database_1.default.service.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        });
        if (existingService) {
            return res.status(409).json({
                success: false,
                error: 'Duplicate service',
                message: 'A service with this name already exists'
            });
        }
        const newService = await database_1.default.service.create({
            data: {
                name: name.trim()
            }
        });
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service: newService,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create service',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// PUT /api/services/:id - Update service (protected route)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Service name is required and must be a non-empty string'
            });
        }
        const existingService = await database_1.default.service.findUnique({
            where: { id }
        });
        if (!existingService) {
            return res.status(404).json({
                success: false,
                error: 'Service not found',
                message: `Service with ID ${id} does not exist`
            });
        }
        const updatedService = await database_1.default.service.update({
            where: { id },
            data: {
                name: name.trim()
            }
        });
        res.json({
            success: true,
            message: 'Service updated successfully',
            service: updatedService,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update service',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// DELETE /api/services/:id - Delete service (protected route)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existingService = await database_1.default.service.findUnique({
            where: { id },
            include: {
                bookings: true
            }
        });
        if (!existingService) {
            return res.status(404).json({
                success: false,
                error: 'Service not found',
                message: `Service with ID ${id} does not exist`
            });
        }
        // Check if service is being used in any bookings
        if (existingService.bookings.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete service',
                message: 'This service is being used in existing bookings and cannot be deleted'
            });
        }
        await database_1.default.service.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Service deleted successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete service',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// GET /api/services/popular - Get popular services (most booked)
router.get('/popular', async (req, res) => {
    try {
        const popularServices = await database_1.default.service.findMany({
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
            message: 'Popular services fetched successfully',
            count: popularServices.length,
            services: popularServices.map(service => ({
                id: service.id,
                name: service.name,
                bookingCount: service._count.bookings
            })),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching popular services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch popular services',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
exports.default = router;
