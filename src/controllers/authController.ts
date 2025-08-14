import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma, { dbManager } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const signup = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      // Handle prepared statement error specifically
      if (dbError?.message?.includes('prepared statement') || 
          dbError?.code === '42P05' ||
          dbError?.message?.includes('already exists')) {
        console.log('Prepared statement error detected, resetting connection...');
        try {
          await dbManager.resetConnection();
          // Retry the query after resetting connection
          existingUser = await prisma.user.findUnique({ where: { email } });
        } catch (retryError) {
          console.error('Retry failed after connection reset:', retryError);
          return res.status(500).json({ error: 'Database connection error, please try again' });
        }
      } else {
        throw dbError;
      }
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    const jwtOptions: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    };
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      jwtOptions
    );

    res.status(201).json({ message: 'User created successfully', user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      // Handle prepared statement error specifically
      if (dbError?.message?.includes('prepared statement') || 
          dbError?.code === '42P05' ||
          dbError?.message?.includes('already exists')) {
        console.log('Prepared statement error detected, resetting connection...');
        try {
          await dbManager.resetConnection();
          // Retry the query after resetting connection
          user = await prisma.user.findUnique({ where: { email } });
        } catch (retryError) {
          console.error('Retry failed after connection reset:', retryError);
          return res.status(500).json({ error: 'Database connection error, please try again' });
        }
      } else {
        throw dbError;
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const jwtOptions: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    };
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      jwtOptions
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { id: true, email: true, createdAt: true, updatedAt: true },
      });
    } catch (dbError: any) {
      // Handle prepared statement error specifically
      if (dbError?.message?.includes('prepared statement') || 
          dbError?.code === '42P05' ||
          dbError?.message?.includes('already exists')) {
        console.log('Prepared statement error detected, resetting connection...');
        try {
          await dbManager.resetConnection();
          // Retry the query after resetting connection
          user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, email: true, createdAt: true, updatedAt: true },
          });
        } catch (retryError) {
          console.error('Retry failed after connection reset:', retryError);
          return res.status(500).json({ error: 'Database connection error, please try again' });
        }
      } else {
        throw dbError;
      }
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

 