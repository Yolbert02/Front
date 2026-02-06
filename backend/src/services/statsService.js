const prisma = require('../config/prisma');

const getStatistics = async () => {
    // Example of RAW query for statistics as requested
    const userStats = await prisma.$queryRaw`
    SELECT r.type_rol, COUNT(u."Id_user") as count
    FROM "Roles" r
    LEFT JOIN "User" u ON r."Id_rol" = u."Id_rol"
    GROUP BY r.type_rol
  `;

    const zoneStats = await prisma.$queryRaw`
    SELECT z.name_zone, COUNT(a."Id_address") as address_count
    FROM "Zone" z
    LEFT JOIN "Address" a ON z."Id_zone" = a."Id_zone"
    GROUP BY z.Id_zone, z.name_zone
  `;

    return {
        userStats,
        zoneStats
    };
};

module.exports = {
    getStatistics
};
