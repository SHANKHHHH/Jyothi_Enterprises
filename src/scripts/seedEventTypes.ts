import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEventTypes() {
  try {
    console.log(' Seeding event types...');

    const eventTypes = [
      {
        name: 'VIP Events (Conferences & Rallys)',
        description: 'High-profile corporate events, political rallies, and conferences'
      },
      {
        name: 'Festivals & Concerts',
        description: 'Music festivals, cultural celebrations, and entertainment events'
      },
      {
        name: 'Social & Corporate Gatherings',
        description: 'Corporate meetings, team building events, and social functions'
      },
      {
        name: 'Amusement Parks, Fairs & Carnivals',
        description: 'Entertainment venues, seasonal fairs, and carnival events'
      },
      {
        name: 'Sports',
        description: 'Sports tournaments, athletic events, and fitness competitions'
      },
      {
        name: 'Weddings & Family Gatherings',
        description: 'Wedding ceremonies, family reunions, and personal celebrations'
      }
    ];

    for (const eventType of eventTypes) {
      const existing = await prisma.eventType.findFirst({
        where: { name: eventType.name }
      });

      if (!existing) {
        await prisma.eventType.create({
          data: {
            name: eventType.name
          }
        });
        console.log(`✅ Created event type: ${eventType.name}`);
      } else {
        console.log(`⏭️  Event type already exists: ${eventType.name}`);
      }
    }

    console.log('🎉 Event types seeding completed!');
    
    // Display all event types
    const allEvents = await prisma.eventType.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Current event types in database:');
    allEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name} (ID: ${event.id})`);
    });

  } catch (error) {
    console.error('❌ Error seeding event types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedEventTypes();
