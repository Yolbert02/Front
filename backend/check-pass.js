const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: "admin@justice.com" }
    });
    console.log('Password for admin@justice.com:', user.password);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
