"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedProducts() {
    try {
        console.log('Starting product seeding...');
        // Clear existing products
        await prisma.orderItem.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.product.deleteMany();
        console.log('Cleared existing products');
        // Seed Products (based on Figma design)
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
        console.log('Product seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding products:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedProducts();
