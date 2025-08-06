import express from 'express';
import {
  submitContactForm,
  testEmailService,
  getContactInfo,
  contactFormValidation,
} from '../controllers/contactController';

const router = express.Router();

// Submit contact form (Get a Quote)
router.post('/submit', contactFormValidation, submitContactForm);

// Test email service (for development/testing)
router.post('/test-email', testEmailService);

// Get contact information
router.get('/info', getContactInfo);

export default router; 