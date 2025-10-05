"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabase = exports.getProfile = exports.login = exports.signup = exports.loginValidation = exports.signupValidation = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
exports.signupValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
const signup = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Test database connection first
        try {
            await database_1.default.$queryRaw `SELECT 1`;
        }
        catch (dbError) {
            console.error('Database connection test failed:', dbError);
            return res.status(500).json({
                error: 'Database connection failed',
                message: 'Unable to connect to database',
                timestamp: new Date().toISOString()
            });
        }
        const existingUser = await database_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await database_1.default.user.create({
            data: { email, passwordHash },
            select: { id: true, email: true, createdAt: true },
        });
        const jwtOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, jwtOptions);
        res.status(201).json({ message: 'User created successfully', user, token });
    }
    catch (error) {
        console.error('Signup error:', error);
        // Provide more detailed error information for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Signup error details:', {
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            error: 'Internal server error',
            message: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const jwtOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, jwtOptions);
        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        // Provide more detailed error information for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Login error details:', {
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            error: 'Internal server error',
            message: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, email: true, createdAt: true, updatedAt: true },
        });
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
// Test endpoint to diagnose database issues
const testDatabase = async (req, res) => {
    try {
        console.log('Testing database connection...');
        // Test basic connection
        await database_1.default.$queryRaw `SELECT 1`;
        console.log('Basic database query successful');
        // Test if users table exists
        const tableExists = await database_1.default.$queryRaw `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
        console.log('Users table exists:', tableExists);
        // Test if we can query users table
        const userCount = await database_1.default.user.count();
        console.log('User count:', userCount);
        res.json({
            success: true,
            message: 'Database connection successful',
            details: {
                basicQuery: 'OK',
                usersTableExists: tableExists,
                userCount: userCount
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database test error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        res.status(500).json({
            success: false,
            error: 'Database test failed',
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString()
        });
    }
};
exports.testDatabase = testDatabase;
