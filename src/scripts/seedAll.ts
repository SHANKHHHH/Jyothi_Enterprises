import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAll() {
  try {
    console.log('🌱 Starting minimal data seeding...');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.bookingEvent.deleteMany();
    await prisma.bookingService.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.eventType.deleteMany();
    await prisma.service.deleteMany();
    await prisma.product.deleteMany();

    console.log('✅ Cleared existing data');

    // Seed Services (minimal - just names)
    const services = [
      'Luxury Toilets',
      'Bio Loos', 
      'Handwash Basins',
      "Men's Urinals",
      'Cooling Systems',
      'Patio Heaters'
    ];

    for (const serviceName of services) {
      await prisma.service.create({ data: { name: serviceName } });
      console.log(`✅ Created service: ${serviceName}`);
    }

    // Seed Event Types (minimal - just names)
    const eventTypes = [
      'VIP Events (Conferences & Rallys)',
      'Festivals & Concerts',
      'Social & Corporate Gatherings',
      'Amusement Parks, Fairs & Carnivals',
      'Sports',
      'Weddings & Family Gatherings'
    ];

    for (const eventName of eventTypes) {
      await prisma.eventType.create({ data: { name: eventName } });
      console.log(`✅ Created event type: ${eventName}`);
    }

    // Seed Products (minimal - just names and basic info for cart)
    const products = [
      { name: 'PM Container' },
      { name: 'Luxury Toilet Unit' },
      { name: 'Bio Loo Unit' },
      { name: 'Handwash Station' },
      { name: 'Cooling System Unit' },
      { name: 'Patio Heater' },
      { name: 'Portable Urinal Unit' },
      { name: 'VIP Restroom Trailer' },
      { name: 'Event Tent Package' },
      { name: 'Mobile Kitchen Unit' }
    ];

    for (const product of products) {
      await prisma.product.create({ 
        data: {
          name: product.name,
          price: 1000, // Dummy price - frontend handles real pricing
          isActive: true
        }
      });
      console.log(`✅ Created product: ${product.name}`);
    }

    console.log('🎉 Minimal data seeded successfully!');
    
    // Display summary
    const serviceCount = await prisma.service.count();
    const eventCount = await prisma.eventType.count();
    const productCount = await prisma.product.count();
    
    console.log(`\n📊 Database Summary:`);
    console.log(`Services: ${serviceCount}`);
    console.log(`Event Types: ${eventCount}`);
    console.log(`Products: ${productCount}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll();
