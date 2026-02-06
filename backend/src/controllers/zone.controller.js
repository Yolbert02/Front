const prisma = require('../config/prisma');
const { zoneSchema } = require('../validators/geographySchema');

const getAllZones = async (req, res) => {
    try {
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
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching zones', error: error.message });
    }
};

const getZoneById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const zone = await prisma.zone.findUnique({
            where: { Id_zone: id },
            include: { city: true }
        });
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.json(zone);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching zone', error: error.message });
    }
};

const createZone = async (req, res) => {
    try {
        const validatedData = zoneSchema.parse(req.body);

        const newZone = await prisma.zone.create({
            data: {
                name_zone: validatedData.name_zone,
                Id_city: validatedData.Id_city,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
            }
        });

        res.status(201).json(newZone);
    } catch (error) {
        res.status(400).json({ message: 'Error creating zone', error: error.message });
    }
};

const updateZone = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validatedData = zoneSchema.partial().parse(req.body);

        const updatedZone = await prisma.zone.update({
            where: { Id_zone: id },
            data: {
                name_zone: validatedData.name_zone,
                Id_city: validatedData.Id_city,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
            }
        });

        res.json(updatedZone);
    } catch (error) {
        res.status(400).json({ message: 'Error updating zone', error: error.message });
    }
};

const deleteZone = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.zone.delete({
            where: { Id_zone: id }
        });
        res.json({ message: 'Zone deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting zone', error: error.message });
    }
};

const toggleZoneStatus = async (req, res) => {
    // Note: status field not present in current schema for Zone, 
    // assuming it might be added or using a placeholder logic for now
    res.status(501).json({ message: 'Toggle status not implemented in DB schema' });
};

const getZonesByCity = async (req, res) => {
    try {
        const id_city = parseInt(req.params.city);
        const filteredZones = await prisma.zone.findMany({
            where: { Id_city: id_city }
        });
        res.json(filteredZones);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching zones by city', error: error.message });
    }
};

module.exports = {
    getAllZones,
    getZoneById,
    createZone,
    updateZone,
    deleteZone,
    toggleZoneStatus,
    getZonesByCity
};
