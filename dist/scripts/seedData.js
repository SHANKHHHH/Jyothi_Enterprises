"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedData() {
    try {
        console.log('Starting database seeding...');
        // Clear existing data
        await prisma.bookingService.deleteMany();
        await prisma.bookingEvent.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.service.deleteMany();
        await prisma.eventType.deleteMany();
        console.log('Cleared existing data');
        // Seed Services (based on Figma design)
        const services = [
            { name: 'Luxury Toilets' },
            { name: 'Bio Loo' },
            { name: 'Handwash Basins' },
            { name: 'Men\'s Urinals' },
            { name: 'Cooling Systems' },
            { name: 'Patio Heaters' },
        ];
        for (const service of services) {
            await prisma.service.create({
                data: service,
            });
        }
        console.log('Services seeded successfully');
        // Seed Event Types (based on Figma design)
        const eventTypes = [
            { name: 'VIP Events (Conferences & Rallys)' },
            { name: 'Festivals & Concerts' },
            { name: 'Social & Corporate Gatherings' },
            { name: 'Amusement Parks, Fairs & Carnivals' },
            { name: 'Sports' },
            { name: 'Weddings & Family Gatherings' },
        ];
        for (const eventType of eventTypes) {
            await prisma.eventType.create({
                data: eventType,
            });
        }
        console.log('Event types seeded successfully');
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedData();
