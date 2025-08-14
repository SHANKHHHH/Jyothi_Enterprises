import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import emailService from '../services/emailService';

// Validation rules for cart operations
export const cartItemValidation = [
  body('productId')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

export const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be 0 or greater'),
];

export const checkoutValidation = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Customer name must be between 2 and 50 characters'),
  
  body('customerEmail')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('customerPhone')
    .trim()
    .matches(/^(\+91\s?)?[0-9]{10}$/)
    .withMessage('Please enter a valid Indian mobile number'),
];

// Get or create cart for session
const getOrCreateCart = async (sessionId: string) => {
  let cart = await prisma.cart.findFirst({
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
    cart = await prisma.cart.create({
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
export const getCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;
    
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
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;
    const { 
      productId, 
      quantity 
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const cart = await getOrCreateCart(sessionId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
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
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;
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
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      });
    } else {
      // Update quantity
      await prisma.cartItem.updateMany({
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
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;
    const { productId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const cart = await getOrCreateCart(sessionId);

    await prisma.cartItem.deleteMany({
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
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const cart = await getOrCreateCart(sessionId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};

// Checkout
export const checkout = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const sessionId = req.headers['session-id'] as string || req.query.sessionId as string;
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
    const order = await prisma.order.create({
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
    const orderWithProducts = await prisma.order.findUnique({
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
    await emailService.sendOrderNotificationToAdmins({
      id: orderWithProducts!.id,
      customerName: orderWithProducts!.customerName,
      customerEmail: orderWithProducts!.customerEmail,
      customerPhone: orderWithProducts!.customerPhone,
      totalAmount: Number(orderWithProducts!.totalAmount),
      status: orderWithProducts!.status,
      createdAt: orderWithProducts!.createdAt,
      items: orderWithProducts!.items.map(item => ({
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
    await emailService.sendOrderConfirmationToUser(orderWithProducts!.customerEmail, {
      id: orderWithProducts!.id,
      customerName: orderWithProducts!.customerName,
      customerEmail: orderWithProducts!.customerEmail,
      customerPhone: orderWithProducts!.customerPhone,
      totalAmount: Number(orderWithProducts!.totalAmount),
      status: orderWithProducts!.status,
      createdAt: orderWithProducts!.createdAt,
      items: orderWithProducts!.items.map(item => ({
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
  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process checkout. Please try again later.',
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

// Get single order (admin only)
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
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
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
};