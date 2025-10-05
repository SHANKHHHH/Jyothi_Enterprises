"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.introduceYourself = exports.getContactInfo = exports.testEmailService = exports.submitContactForm = exports.introduceYourselfValidation = exports.contactFormValidation = void 0;
const express_validator_1 = require("express-validator");
const emailService_1 = __importDefault(require("../services/emailService"));
// Validation rules for contact form
exports.contactFormValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('mobileNumber')
        .trim()
        .matches(/^(\+91\s?)?[0-9]{10}$/)
        .withMessage('Please enter a valid Indian mobile number'),
    (0, express_validator_1.body)('productType')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Product type is required and must be less than 100 characters'),
    (0, express_validator_1.body)('eventType')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Event type is required and must be less than 100 characters'),
    (0, express_validator_1.body)('paxCount')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Pax count is required and must be less than 20 characters'),
    (0, express_validator_1.body)('startDate')
        .trim()
        .isISO8601()
        .withMessage('Please enter a valid start date'),
    (0, express_validator_1.body)('startTime')
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please enter a valid start time (HH:MM format)'),
    (0, express_validator_1.body)('startTimePeriod')
        .trim()
        .isIn(['AM', 'PM'])
        .withMessage('Start time period must be AM or PM'),
    (0, express_validator_1.body)('endDate')
        .trim()
        .isISO8601()
        .withMessage('Please enter a valid end date'),
    (0, express_validator_1.body)('endTime')
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please enter a valid end time (HH:MM format)'),
    (0, express_validator_1.body)('endTimePeriod')
        .trim()
        .isIn(['AM', 'PM'])
        .withMessage('End time period must be AM or PM'),
];
// Validation rules for introduce yourself form
exports.introduceYourselfValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('mobileNumber')
        .trim()
        .matches(/^(\+91\s?)?[0-9]{10}$/)
        .withMessage('Please enter a valid Indian mobile number'),
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('gst')
        .optional()
        .trim()
        .isLength({ min: 15, max: 15 })
        .withMessage('GST number must be exactly 15 characters'),
];
// Submit contact form
const submitContactForm = async (req, res) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const formData = req.body;
        // Save to database if needed (optional)
        // const contact = await dbManager.executeQuery(async () => {
        //   return await prisma.contact.create({
        //     data: formData
        //   });
        // });
        // Send email notification
        await emailService_1.default.sendContactFormEmail(formData);
        return res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully! We will contact you soon.',
        });
    }
    catch (error) {
        console.error('Contact form submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again later.',
        });
    }
};
exports.submitContactForm = submitContactForm;
// Test email service
const testEmailService = async (req, res) => {
    try {
        console.log('🧪 Testing email service...');
        // Check API key status
        const apiKey = process.env.RESEND_API_KEY;
        const apiKeyStatus = {
            present: !!apiKey,
            length: apiKey?.length || 0,
            startsWith: apiKey?.substring(0, 10) || 'N/A',
            endsWith: apiKey?.substring(apiKey.length - 10) || 'N/A'
        };
        console.log('🔑 API Key Status:', apiKeyStatus);
        // Test Resend API directly
        const emailSent = await emailService_1.default.testEmailService();
        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'Test email sent successfully!',
                apiKeyStatus
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send test email. Check server logs for details.',
                apiKeyStatus,
                debug: {
                    apiKeyPresent: !!apiKey,
                    apiKeyLength: apiKey?.length || 0,
                    note: 'Check server console for detailed error logs'
                }
            });
        }
    }
    catch (error) {
        console.error('❌ Test email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during test email.',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
};
exports.testEmailService = testEmailService;
// Get contact information
const getContactInfo = async (req, res) => {
    try {
        const contactInfo = {
            phone: {
                mobile: '+91 99000 22300',
                hotline: '+91 99000 22301',
            },
            email: {
                info: 'flexxftw12@gmail.com',
                sales: 'flexxftw12@gmail.com',
            },
            address: 'Your business address here',
            businessHours: '24/7 Service Available',
        };
        return res.status(200).json({
            success: true,
            data: contactInfo,
        });
    }
    catch (error) {
        console.error('Get contact info error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch contact information.',
        });
    }
};
exports.getContactInfo = getContactInfo;
// Introduce yourself endpoint
const introduceYourself = async (req, res) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        // Extract form data
        const formData = {
            name: req.body.name,
            mobileNumber: req.body.mobileNumber,
            email: req.body.email,
            gst: req.body.gst || '',
            additionalDocument: req.file ? req.file.filename : null,
        };
        // Send email notification to admins
        const emailSent = await emailService_1.default.sendIntroduceYourselfEmail(formData);
        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'Introduction submitted successfully! We will contact you soon.',
                data: {
                    submittedAt: new Date().toISOString(),
                    customerName: formData.name,
                    hasDocument: !!formData.additionalDocument,
                },
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.',
            });
        }
    }
    catch (error) {
        console.error('Introduce yourself submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};
exports.introduceYourself = introduceYourself;
