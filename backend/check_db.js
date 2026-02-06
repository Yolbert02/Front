const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const zones = await prisma.zone.findMany({
        include: {
            city: {
                include: {
                    parish: {
                        include: {
                            municipality: {
                                include: {
                                    state: {
                                        include: {
                                            country: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log('--- Zones and Hierarchy ---');
    console.log('Count:', zones.length);
    if (zones.length > 0) {
        console.log('Sample Zone:', zones[0].name_zone);
        console.log('City:', zones[0].city?.name_city);
    }

    const complaints = await prisma.complaint.findMany({
        include: {
            user: true,
            zone: true
        }
    });
    console.log('--- Complaints ---');
    console.log('Count:', complaints.length);
    if (complaints.length > 0) {
        console.log('First Title:', complaints[0].title);
        console.log('Connected User:', complaints[0].user?.email);
        console.log('Connected Zone:', complaints[0].zone?.name_zone);
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
