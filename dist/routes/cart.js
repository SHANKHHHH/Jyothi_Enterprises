"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const router = express_1.default.Router();
// Get cart details
router.get('/cart', cartController_1.getCart);
// Add item to cart
router.post('/cart/items', cartController_1.cartItemValidation, cartController_1.addToCart);
// Update cart item quantity
router.put('/cart/items/:itemId', cartController_1.updateCartItemValidation, cartController_1.updateCartItem);
// Remove item from cart
router.delete('/cart/items/:itemId', cartController_1.removeFromCart);
// Checkout
router.post('/cart/checkout', cartController_1.checkoutValidation, cartController_1.checkout);
// Get all orders (admin only)
router.get('/orders', cartController_1.getAllOrders);
// Get single order (admin only)
router.get('/orders/:id', cartController_1.getOrder);
exports.default = router;