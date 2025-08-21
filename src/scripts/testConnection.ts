import prisma from '../config/database';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Raw query test passed:', result);
    
    // Test Prisma query
    const productCount = await prisma.product.count();
    console.log('✅ Prisma query test passed. Product count:', productCount);
    
    // Test cart query
    const cartCount = await prisma.cart.count();
    console.log('✅ Cart query test passed. Cart count:', cartCount);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

testConnection();
