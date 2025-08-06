"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactController_1 = require("../controllers/contactController");
const router = express_1.default.Router();
// Submit contact form (Get a Quote)
router.post('/submit', contactController_1.contactFormValidation, contactController_1.submitContactForm);
// Test email service (for development/testing)
router.post('/test-email', contactController_1.testEmailService);
// Get contact information
router.get('/info', contactController_1.getContactInfo);
exports.default = router;
