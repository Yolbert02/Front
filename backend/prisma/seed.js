const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started: Verifying essential system roles...');

    // 1. Roles (Upsert to ensure they exist)
    const roleTypes = ['administrator', 'oficial', 'functionary', 'civil'];

    for (const type of roleTypes) {
        await prisma.roles.upsert({
            where: { type_rol: type },
            update: {},
            create: { type_rol: type },
        });
    }

    console.log('✅ Essential roles verified (administrator, oficial, functionary, civil).');

    await prisma.police_Unit.upsert({
        where: { name_unit: 'Unidad Central' },
        update: {},
        create: { name_unit: 'Unidad Central' }
    });

    console.log('✅ Basic Police Unit verified.');
    console.log('Seed finished successfully. No sample users or assignments were created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
