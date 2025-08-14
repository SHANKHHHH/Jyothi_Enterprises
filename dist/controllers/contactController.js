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
        // Extract form data
        const formData = {
            name: req.body.name,
            mobileNumber: req.body.mobileNumber,
            productType: req.body.productType,
            eventType: req.body.eventType,
            paxCount: req.body.paxCount,
            startDate: req.body.startDate,
            startTime: req.body.startTime,
            startTimePeriod: req.body.startTimePeriod,
            endDate: req.body.endDate,
            endTime: req.body.endTime,
            endTimePeriod: req.body.endTimePeriod,
        };
        // Send email
        const emailSent = await emailService_1.default.sendContactFormEmail(formData);
        // Send confirmation email to user
        await emailService_1.default.sendQuoteConfirmationToUser(req.body.email, formData);
        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'Quote request submitted successfully! We will contact you soon.',
                data: {
                    submittedAt: new Date().toISOString(),
                    customerName: formData.name,
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
        console.error('Contact form submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};
exports.submitContactForm = submitContactForm;
// Test email service
const testEmailService = async (req, res) => {
    try {
        const emailSent = await emailService_1.default.testEmailService();
        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'Test email sent successfully!',
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send test email. Please check your email configuration.',
            });
        }
    }
    catch (error) {
        console.error('Test email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during test email.',
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
                info: 'gdhruv579@gmail.com',
                sales: 'dhruvgupfa523@gmail.com',
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
