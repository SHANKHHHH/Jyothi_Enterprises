"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.getAllOrders = exports.checkout = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = exports.checkoutValidation = exports.updateCartItemValidation = exports.cartItemValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = __importDefault(require("../services/emailService"));
// Validation rules for cart operations
exports.cartItemValidation = [
    (0, express_validator_1.body)('productId')
        .isString()
        .notEmpty()
        .withMessage('Product ID is required'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
];
exports.updateCartItemValidation = [
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be 0 or greater'),
];
exports.checkoutValidation = [
    (0, express_validator_1.body)('customerName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Customer name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('customerEmail')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('customerPhone')
        .trim()
        .matches(/^(\+91\s?)?[0-9]{10}$/)
        .withMessage('Please enter a valid Indian mobile number'),
];
// Get or create cart for session
const getOrCreateCart = async (sessionId) => {
    let cart = await database_1.default.cart.findFirst({
        where: { sessionId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!cart) {
        cart = await database_1.default.cart.create({
            data: { sessionId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    return cart;
};
// Get cart details
const getCart = async (req, res) => {
    try {
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        // Calculate totals
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cart.items.reduce((sum, item) => {
            const price = item.product.originalPrice || item.product.price;
            return sum + (Number(price) * item.quantity);
        }, 0);
        return res.status(200).json({
            success: true,
            data: {
                cartId: cart.id,
                items: cart.items,
                totalItems,
                totalAmount: Number(totalAmount),
            },
        });
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
        });
    }
};
exports.getCart = getCart;
// Add item to cart
const addToCart = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        const { productId, quantity } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        // Check if item already exists in cart
        const existingItem = await database_1.default.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });
        if (existingItem) {
            // Update quantity
            await database_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            // Add new item
            await database_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }
        // Get updated cart
        const updatedCart = await getOrCreateCart(sessionId);
        return res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                cartId: updatedCart.id,
                items: updatedCart.items,
            },
        });
    }
    catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
        });
    }
};
exports.addToCart = addToCart;
// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        const { productId, quantity } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        if (quantity === 0) {
            // Remove item from cart
            await database_1.default.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId,
                },
            });
        }
        else {
            // Update quantity
            await database_1.default.cartItem.updateMany({
                where: {
                    cartId: cart.id,
                    productId,
                },
                data: { quantity },
            });
        }
        // Get updated cart
        const updatedCart = await getOrCreateCart(sessionId);
        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: {
                cartId: updatedCart.id,
                items: updatedCart.items,
            },
        });
    }
    catch (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
        });
    }
};
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        const { productId } = req.params;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        await database_1.default.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId,
            },
        });
        // Get updated cart
        const updatedCart = await getOrCreateCart(sessionId);
        return res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: {
                cartId: updatedCart.id,
                items: updatedCart.items,
            },
        });
    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
        });
    }
};
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = async (req, res) => {
    try {
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        await database_1.default.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
        });
    }
};
exports.clearCart = clearCart;
// Checkout
const checkout = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const sessionId = req.headers['session-id'] || req.query.sessionId;
        const { customerName, customerEmail, customerPhone } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }
        const cart = await getOrCreateCart(sessionId);
        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }
        // Calculate total amount
        const totalAmount = cart.items.reduce((sum, item) => {
            const price = item.product.originalPrice || item.product.price;
            return sum + (Number(price) * item.quantity);
        }, 0);
        // Create order
        const order = await database_1.default.order.create({
            data: {
                cartId: cart.id,
                customerName,
                customerEmail,
                customerPhone,
                totalAmount,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
        });
        // Fetch the order with product data for email sending
        const orderWithProducts = await database_1.default.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        // Send order notification email to admins
        await emailService_1.default.sendOrderNotificationToAdmins({
            id: orderWithProducts.id,
            customerName: orderWithProducts.customerName,
            customerEmail: orderWithProducts.customerEmail,
            customerPhone: orderWithProducts.customerPhone,
            totalAmount: Number(orderWithProducts.totalAmount),
            status: orderWithProducts.status,
            createdAt: orderWithProducts.createdAt,
            items: orderWithProducts.items.map(item => ({
                quantity: item.quantity,
                price: Number(item.product.price),
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    description: item.product.description || undefined,
                },
            })),
        });
        // Send confirmation email to user
        await emailService_1.default.sendOrderConfirmationToUser(orderWithProducts.customerEmail, {
            id: orderWithProducts.id,
            customerName: orderWithProducts.customerName,
            customerEmail: orderWithProducts.customerEmail,
            customerPhone: orderWithProducts.customerPhone,
            totalAmount: Number(orderWithProducts.totalAmount),
            status: orderWithProducts.status,
            createdAt: orderWithProducts.createdAt,
            items: orderWithProducts.items.map(item => ({
                quantity: item.quantity,
                price: Number(item.product.price),
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    description: item.product.description || undefined,
                },
            })),
        });
        return res.status(201).json({
            success: true,
            message: 'Order placed successfully! We will contact you soon.',
            data: {
                orderId: order.id,
                totalAmount: Number(order.totalAmount),
                customerName: order.customerName,
                submittedAt: order.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error during checkout:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process checkout. Please try again later.',
        });
    }
};
exports.checkout = checkout;
// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await database_1.default.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
        });
    }
};
exports.getAllOrders = getAllOrders;
// Get single order (admin only)
const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await database_1.default.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
        });
    }
};
exports.getOrder = getOrder;
