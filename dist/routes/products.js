"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// GET /api/products - Get all products (basic data only)
router.get('/', async (req, res) => {
    try {
        const products = await database_1.default.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                isActive: true
            },
            orderBy: { name: 'asc' }
        });
        res.json({
            success: true,
            message: 'Products fetched successfully',
            count: products.length,
            products: products,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// GET /api/products/:id - Get specific product (basic data only)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await database_1.default.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `Product with ID ${id} does not exist`
            });
        }
        res.json({
            success: true,
            message: 'Product fetched successfully',
            product: product,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
// POST /api/products - Create new product (protected route)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Product name is required'
            });
        }
        const newProduct = await database_1.default.product.create({
            data: {
                name: name.trim(),
                price: 1000, // Dummy price
                isActive: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: newProduct,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
            message: error instanceof Error ? error.message : 'Database error occurred'
        });
    }
});
exports.default = router;
