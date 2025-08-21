import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout,
  getAllOrders,
  getOrder,
  cartItemValidation,
  updateCartItemValidation,
  checkoutValidation,
} from '../controllers/cartController';

const router = express.Router();

// Get cart details
router.get('/', getCart);

// Add item to cart
router.post('/items', cartItemValidation, addToCart);

// Update cart item quantity
router.put('/items/:itemId', updateCartItemValidation, updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// Checkout
router.post('/checkout', checkoutValidation, checkout);

// Get all orders (admin only)
router.get('/orders', getAllOrders);

// Get single order (admin only)
router.get('/orders/:id', getOrder);

export default router; 