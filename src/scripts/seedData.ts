import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Starting data seeding...');

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

    console.log('Cleared existing data');

    // Seed Services
    const services = [
      {
        name: 'PM Container',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Luxury Toilet Unit',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Bio Loo Unit',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Handwash Station',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Cooling System Unit',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Patio Heater',
        // Add more fields as needed based on your requirements
      },
    ];

    for (const service of services) {
      await prisma.service.create({
        data: service,
      });
    }

    console.log('Services seeded successfully');

    // Seed Products
    const products = [
      {
        name: 'PM Container',
        description: 'Portable toilet container with modern amenities',
        price: 37489.00,
        originalPrice: 37489.00,
        imageUrl: '/images/pm-container.jpg',
        rating: 5.0,
        reviewCount: 25,
        isBestseller: true,
        isActive: true,
      },
      {
        name: 'Luxury Toilet Unit',
        description: 'Premium portable toilet with luxury features',
        price: 45000.00,
        originalPrice: 50000.00,
        imageUrl: '/images/luxury-toilet.jpg',
        rating: 4.8,
        reviewCount: 18,
        isBestseller: false,
        isActive: true,
      },
      {
        name: 'Bio Loo Unit',
        description: 'Eco-friendly portable toilet solution',
        price: 28000.00,
        originalPrice: 32000.00,
        imageUrl: '/images/bio-loo.jpg',
        rating: 4.5,
        reviewCount: 12,
        isBestseller: false,
        isActive: true,
      },
      {
        name: 'Handwash Station',
        description: 'Portable handwashing station with water tank',
        price: 15000.00,
        originalPrice: 18000.00,
        imageUrl: '/images/handwash-station.jpg',
        rating: 4.7,
        reviewCount: 8,
        isBestseller: false,
        isActive: true,
      },
      {
        name: 'Cooling System Unit',
        description: 'Portable air conditioning system for events',
        price: 75000.00,
        originalPrice: 85000.00,
        imageUrl: '/images/cooling-system.jpg',
        rating: 4.9,
        reviewCount: 15,
        isBestseller: true,
        isActive: true,
      },
      {
        name: 'Patio Heater',
        description: 'Outdoor heating solution for cold weather events',
        price: 22000.00,
        originalPrice: 25000.00,
        imageUrl: '/images/patio-heater.jpg',
        rating: 4.6,
        reviewCount: 10,
        isBestseller: false,
        isActive: true,
      },
    ];

    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }

    console.log('Products seeded successfully');

    // Seed Event Types
    const eventTypes = [
      {
        name: 'Wedding',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Corporate Event',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Birthday Party',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Exhibition',
        // Add more fields as needed based on your requirements
      },
      {
        name: 'Outdoor Festival',
        // Add more fields as needed based on your requirements
      },
    ];

    for (const eventType of eventTypes) {
      await prisma.eventType.create({
        data: eventType,
      });
    }

    console.log('Event types seeded successfully');
    console.log('All data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();