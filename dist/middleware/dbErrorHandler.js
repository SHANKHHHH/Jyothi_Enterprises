"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbErrorHandler = void 0;
const database_1 = require("../config/database");
const dbErrorHandler = async (error, req, res, next) => {
    // Check if this is a prepared statement error
    if (error?.message?.includes('prepared statement') ||
        error?.code === '42P05' ||
        error?.message?.includes('already exists')) {
        console.log('Prepared statement error detected in middleware, resetting connection...');
        try {
            await database_1.dbManager.resetConnection();
            console.log('Database connection reset successfully');
            // Continue to the next middleware/route handler
            // The original request will be retried by the controller
            return next();
        }
        catch (resetError) {
            console.error('Failed to reset database connection in middleware:', resetError);
            return res.status(500).json({
                error: 'Database connection error, please try again',
                details: 'Connection reset failed'
            });
        }
    }
    // For other errors, pass them to the next error handler
    next(error);
};
exports.dbErrorHandler = dbErrorHandler;
