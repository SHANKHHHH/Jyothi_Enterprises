import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServices() {
  try {
    console.log('🌱 Seeding services...');

    const services = [
      {
        name: 'Luxury Toilets',
        description: 'Premium portable toilet units with modern amenities'
      },
      {
        name: 'Bio Loos',
        description: 'Eco-friendly portable toilets for outdoor events'
      },
      {
        name: 'Handwash Basins',
        description: 'Portable handwashing stations with running water'
      },
      {
        name: "Men's Urinals",
        description: 'Portable urinal units for male attendees'
      },
      {
        name: 'Cooling Systems',
        description: 'Portable air conditioning and cooling units'
      },
      {
        name: 'Patio Heaters',
        description: 'Outdoor heating systems for cold weather events'
      }
    ];

    for (const service of services) {
      const existing = await prisma.service.findFirst({
        where: { name: service.name }
      });

      if (!existing) {
        await prisma.service.create({
          data: {
            name: service.name
          }
        });
        console.log(`✅ Created service: ${service.name}`);
      } else {
        console.log(`⏭️  Service already exists: ${service.name}`);
      }
    }

    console.log('🎉 Services seeding completed!');
    
    // Display all services
    const allServices = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Current services in database:');
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} (ID: ${service.id})`);
    });

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedServices();

