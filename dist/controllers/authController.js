"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.signup = exports.loginValidation = exports.signupValidation = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = __importStar(require("../config/database"));
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
        let existingUser;
        try {
            existingUser = await database_1.default.user.findUnique({ where: { email } });
        }
        catch (dbError) {
            // Handle prepared statement error specifically
            if (dbError?.message?.includes('prepared statement') ||
                dbError?.code === '42P05' ||
                dbError?.message?.includes('already exists')) {
                console.log('Prepared statement error detected, resetting connection...');
                try {
                    await database_1.dbManager.resetConnection();
                    // Retry the query after resetting connection
                    existingUser = await database_1.default.user.findUnique({ where: { email } });
                }
                catch (retryError) {
                    console.error('Retry failed after connection reset:', retryError);
                    return res.status(500).json({ error: 'Database connection error, please try again' });
                }
            }
            else {
                throw dbError;
            }
        }
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
        res.status(500).json({ error: 'Internal server error' });
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
        let user;
        try {
            user = await database_1.default.user.findUnique({ where: { email } });
        }
        catch (dbError) {
            // Handle prepared statement error specifically
            if (dbError?.message?.includes('prepared statement') ||
                dbError?.code === '42P05' ||
                dbError?.message?.includes('already exists')) {
                console.log('Prepared statement error detected, resetting connection...');
                try {
                    await database_1.dbManager.resetConnection();
                    // Retry the query after resetting connection
                    user = await database_1.default.user.findUnique({ where: { email } });
                }
                catch (retryError) {
                    console.error('Retry failed after connection reset:', retryError);
                    return res.status(500).json({ error: 'Database connection error, please try again' });
                }
            }
            else {
                throw dbError;
            }
        }
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
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        let user;
        try {
            user = await database_1.default.user.findUnique({
                where: { id: req.user?.id },
                select: { id: true, email: true, createdAt: true, updatedAt: true },
            });
        }
        catch (dbError) {
            // Handle prepared statement error specifically
            if (dbError?.message?.includes('prepared statement') ||
                dbError?.code === '42P05' ||
                dbError?.message?.includes('already exists')) {
                console.log('Prepared statement error detected, resetting connection...');
                try {
                    await database_1.dbManager.resetConnection();
                    // Retry the query after resetting connection
                    user = await database_1.default.user.findUnique({
                        where: { id: req.user?.id },
                        select: { id: true, email: true, createdAt: true, updatedAt: true },
                    });
                }
                catch (retryError) {
                    console.error('Retry failed after connection reset:', retryError);
                    return res.status(500).json({ error: 'Database connection error, please try again' });
                }
            }
            else {
                throw dbError;
            }
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
