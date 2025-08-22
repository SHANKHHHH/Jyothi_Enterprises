"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
            { name: 'Bio Loo Portable Chemical toilet wc Lexus' },
            { name: 'Bio Loo Hi-Tech WC with health faucet' },
            { name: 'Bio Loo Portable Chemical Toilet ECO' },
            { name: 'Bio Loo Handicap Toilet' },
            { name: 'Bio Handwash 2-Tap' },
            { name: 'Bio Mens Urinals Cross 4x1' },
            { name: 'PM Container' },
            { name: 'Bio Loo Prime Luxury Female Container' },
            { name: 'Bio Loo Prime Luxury Male Container' },
            { name: 'Bio Loo Prime Luxury 2-in-1 Container' },
            { name: 'Bio Loo Portable Toilet Mains Connection WC' },
            { name: 'Bio Loo Portable Toilet Mains Connection IWC' },
            { name: 'Bio Mens Urinals 3-in-1' },
            { name: 'Bio Handwash Sink (Per Tap)' },
            { name: 'Bio Loo Shower Cabin' },
            { name: 'Ductable AC – 11 Ton' },
            { name: 'Tower AC (5 Ton)' },
            { name: 'Portable AC (1.5 Ton)' },
            { name: 'Airon Water-Air Cooler 110 Ltr' },
            { name: 'Airon Water-Air Cooler 60 Ltr' },
            { name: 'Airon Tower Cooler' },
            { name: 'Airon Mist Fan' },
            { name: 'Pedestal Fan' },
            { name: 'Patio Heater' },
            { name: 'Fire Extinguisher CO2 GAS' },
            { name: 'Fire Extinguisher NITROGEN GAS' }
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
    }
    catch (error) {
        console.error('Error seeding data:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedAll();
