const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log('--- USERS IN DB ---');
    users.forEach(u => {
        console.log(`DNI: ${u.dni} | Email: ${u.email} | Name: ${u.first_name} ${u.last_name} | Role: ${u.role.type_rol} | Status: ${u.status_user}`);
    });

    const assignments = await prisma.assignment.findMany();
    console.log('\n--- ASSIGNMENTS IN DB ---');
    console.log(assignments);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
