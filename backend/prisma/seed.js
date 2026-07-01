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

    // 2. Crimes (Delitos)
    const crimes = [
        { title: 'Robo', description: 'Sustracción de pertenencias (teléfonos, vehículos, dinero) utilizando la violencia, amenaza o uso de armas.' },
        { title: 'Hurto', description: 'Sustracción de pertenencias ajenas de forma sigilosa, sin utilizar la violencia ni amenazas contra la persona (ej. carterismo).' },
        { title: 'Estafa', description: 'Uso del engaño para que la víctima entregue dinero o bienes voluntariamente (incluye falsas ventas de vehículos o divisas).' },
        { title: 'Extorsión ("Cobro de Vacunas")', description: 'Amenazar o intimidar a una persona o comerciante para obligarla a pagar una suma de dinero a cambio de su seguridad o la de su familia.' },
        { title: 'Hackeo / Robo de Identidad', description: 'Apropiación indebida de cuentas de redes sociales, WhatsApp o correo electrónico para hacerse pasar por la víctima.' },
        { title: 'Fraude Electrónico', description: 'Estafas realizadas mediante transferencias falsas, phishing (robo de datos bancarios) o manipulación de plataformas como Pago Móvil, Zelle o Binance.' },
        { title: 'Difusión de Material Íntimo', description: 'Publicación o amenaza de publicación de fotos o videos íntimos sin el consentimiento de la persona (Ciberextorsión).' },
        { title: 'Lesiones Personales', description: 'Agresiones físicas (golpes, heridas con armas) que causan daño a la salud de la víctima.' },
        { title: 'Homicidio / Intento de Homicidio', description: 'Causar (o intentar causar) la muerte a otra persona.' },
        { title: 'Violencia Física', description: 'Golpes o maltratos dentro del núcleo familiar o en la pareja.' },
        { title: 'Violencia Psicológica', description: 'Insultos, humillaciones, amenazas o control constante que afecten la estabilidad emocional de la víctima.' },
        { title: 'Acoso u Hostigamiento', description: 'Persecución constante o intimidación sistemática en persona o por vías de comunicación.' },
        { title: 'Abuso Sexual / Violación', description: 'Cualquier acto sexual o tocamiento forzado realizado sin el consentimiento de la víctima.' },
        { title: 'Acoso Sexual', description: 'Exigencia de favores sexuales no deseados, frecuentemente bajo amenaza de represalias en el entorno laboral o académico.' },
        { title: 'Concusión / Soborno ("Matraca")', description: 'Cuando un funcionario público o policial exige dinero, bienes o favores a cambio de no imponer una multa, agilizar un trámite o permitir un acto ilegal.' },
        { title: 'Abuso de Autoridad', description: 'Uso excesivo o injustificado de la fuerza por parte de cuerpos de seguridad o detenciones arbitrarias sin orden judicial.' },
        { title: 'Secuestro', description: 'Privación ilegítima de la libertad de una persona con el objetivo de exigir un rescate (dinero o bienes) a cambio de su liberación.' },
        { title: 'Trata de Personas', description: 'Captación y traslado de personas mediante engaño para su posterior explotación laboral o sexual.' },
        { title: 'Contaminación y Daño Ambiental', description: 'Vertido ilegal de basura, tala no autorizada, quema indiscriminada o contaminación de fuentes de agua.' },
        { title: 'Invasión de Propiedad', description: 'Ocupación ilegal de un inmueble, terreno o vivienda ajena.' }
    ];

    for (const crime of crimes) {
        await prisma.crime.upsert({
            where: { title: crime.title },
            update: { description: crime.description },
            create: crime,
        });
    }
    console.log('✅ Crimes verified.');

    // 3. Geography & Courts for San Cristobal, Tachira
    const country = await prisma.country.upsert({
        where: { name_country: 'Venezuela' },
        update: {},
        create: { name_country: 'Venezuela' }
    });

    // Create State Tachira (Assuming we find or create since there's no unique constraint on name_state, but we will assume it's created or we create it)
    let state = await prisma.state.findFirst({ where: { name_state: 'Táchira', Id_country: country.Id_country } });
    if (!state) {
        state = await prisma.state.create({ data: { name_state: 'Táchira', Id_country: country.Id_country } });
    }

    let municipality = await prisma.municipality.findFirst({ where: { name_municipality: 'San Cristóbal', Id_state: state.Id_state } });
    if (!municipality) {
        municipality = await prisma.municipality.create({ data: { name_municipality: 'San Cristóbal', Id_state: state.Id_state } });
    }

    let parish = await prisma.parish.findFirst({ where: { name_parish: 'San Juan Bautista', Id_municipality: municipality.Id_municipality } });
    if (!parish) {
        parish = await prisma.parish.create({ data: { name_parish: 'San Juan Bautista', Id_municipality: municipality.Id_municipality } });
    }

    let city = await prisma.city.findFirst({ where: { name_city: 'San Cristóbal', Id_parish: parish.Id_parish } });
    if (!city) {
        city = await prisma.city.create({ data: { name_city: 'San Cristóbal', Id_parish: parish.Id_parish } });
    }

    // Create all patrol zones for San Cristóbal
    const zoneNames = ['Pueblo Nuevo', 'Barrio Obrero', 'Centro', 'Santa Teresa', 'La Concordia'];
    const zoneCoords = [
        { lat: 7.7975, lng: -72.2200 },
        { lat: 7.7675, lng: -72.2125 },
        { lat: 7.7675, lng: -72.2300 },
        { lat: 7.7675, lng: -72.2450 },
        { lat: 7.7400, lng: -72.2300 },
    ];

    const createdZones = [];
    for (let i = 0; i < zoneNames.length; i++) {
        let z = await prisma.zone.findFirst({ where: { name_zone: zoneNames[i], Id_city: city.Id_city } });
        if (!z) {
            z = await prisma.zone.create({ 
                data: { 
                    name_zone: zoneNames[i], 
                    Id_city: city.Id_city, 
                    latitude: zoneCoords[i].lat, 
                    longitude: zoneCoords[i].lng 
                } 
            });
        }
        createdZones.push(z);
    }
    const zone = createdZones.find(z => z.name_zone === 'Centro') || createdZones[0];

    // Create address for Courts
    const courtAddress = await prisma.address.create({
        data: {
            Id_zone: zone.Id_zone,
            name_address: 'Edificio Nacional Administrativo, 7ma Avenida con Calle 3 y 4, San Cristóbal'
        }
    });

    // Create Courts
    const courts = [
        { name: 'Tribunal Primero de Primera Instancia en lo Penal', type: 'Penal' },
        { name: 'Tribunal Segundo de Control', type: 'Penal' },
        { name: 'Tribunal Superior Civil', type: 'Civil' },
        { name: 'Tribunal de Protección de Niños, Niñas y Adolescentes', type: 'Protección' },
        { name: 'Tribunal Laboral de San Cristóbal', type: 'Laboral' }
    ];

    for (const c of courts) {
        await prisma.court.create({
            data: {
                name_court: c.name,
                jurisdiction_type: c.type,
                Id_address: courtAddress.Id_address
            }
        });
    }

    console.log('✅ Geography and Courts verified.');
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
