const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get ALL bookings
    const allBookings = await prisma.booking.findMany();
    console.log('All bookings in DB:', allBookings.length);
    allBookings.forEach(b => {
      console.log(`  - ID: ${b.id}, Date: ${b.date}, TimeSlot: ${b.timeSlot}, Name: ${b.fullName}`);
    });

    // Try the date range query like the API does
    const dateParam = '2026-05-05';
    const startDate = new Date(dateParam + 'T00:00:00Z');
    const endDate = new Date(dateParam + 'T23:59:59Z');
    
    console.log(`\nQuerying bookings for date range:`);
    console.log(`  Start: ${startDate}`);
    console.log(`  End: ${endDate}`);

    const bookingsForDate = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    console.log(`Found ${bookingsForDate.length} bookings for ${dateParam}`);
    bookingsForDate.forEach(b => {
      console.log(`  - TimeSlot: ${b.timeSlot}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
