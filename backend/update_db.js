const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "incident_date" DATE;
    `);
        console.log('Successfully added incident_date column to Complaint table');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
