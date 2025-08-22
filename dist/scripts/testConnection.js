"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        // Test basic connection
        await database_1.default.$connect();
        console.log('✅ Database connected successfully');
        // Test simple query
        const result = await database_1.default.$queryRaw `SELECT 1 as test`;
        console.log('✅ Raw query test passed:', result);
        // Test Prisma query
        const productCount = await database_1.default.product.count();
        console.log('✅ Prisma query test passed. Product count:', productCount);
        // Test cart query
        const cartCount = await database_1.default.cart.count();
        console.log('✅ Cart query test passed. Cart count:', cartCount);
        console.log('🎉 All database tests passed!');
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
    }
    finally {
        await database_1.default.$disconnect();
        console.log('🔌 Database disconnected');
    }
}
testConnection();
