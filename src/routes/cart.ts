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
router.get('/cart', getCart);

// Add item to cart
router.post('/cart/items', cartItemValidation, addToCart);

// Update cart item quantity
router.put('/cart/items/:itemId', updateCartItemValidation, updateCartItem);

// Remove item from cart
router.delete('/cart/items/:itemId', removeFromCart);

// Checkout
router.post('/cart/checkout', checkoutValidation, checkout);

// Get all orders (admin only)
router.get('/orders', getAllOrders);

// Get single order (admin only)
router.get('/orders/:id', getOrder);

export default router; 