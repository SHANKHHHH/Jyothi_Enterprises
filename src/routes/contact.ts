import express from 'express';
import upload from '../middleware/upload';
import {
  submitContactForm,
  testEmailService,
  getContactInfo,
  contactFormValidation,
  introduceYourself,
  introduceYourselfValidation,
} from '../controllers/contactController';

const router = express.Router();

// Submit contact form (Get a Quote)
router.post('/submit', contactFormValidation, submitContactForm);

// Introduce yourself endpoint with file upload
router.post('/introduce-yourself', 
  upload.single('additionalDocument'), 
  introduceYourselfValidation, 
  introduceYourself
);

// Test email service (for development/testing)
router.post('/test-email', testEmailService);

// Get contact information
router.get('/info', getContactInfo);

export default router;