const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        console.log('Testing connection...');
        const usersCount = await prisma.user.count();
        console.log('Total users:', usersCount);

        try {
            const complaintsCount = await prisma.complaint.count();
            console.log('Total complaints:', complaintsCount);

            const sample = await prisma.complaint.findFirst();
            console.log('Sample complaint columns:', Object.keys(sample || {}));
        } catch (e) {
            console.error('Error fetching complaints:', e.message);
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
