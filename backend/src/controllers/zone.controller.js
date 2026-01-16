const { zones, saveData } = require('../data/storage');

const getAllZones = (req, res) => {
    res.json(zones);
};

const getZoneById = (req, res) => {
    const id = parseInt(req.params.id);
    const zone = zones.find(z => z.id === id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
};

const createZone = (req, res) => {
    const { name, city, state, parish, municipality, latitude, longitude } = req.body;

    const newZone = {
        id: zones.length > 0 ? Math.max(...zones.map(z => z.id)) + 1 : 1,
        name,
        city,
        state,
        parish,
        municipality,
        latitude: latitude || 0,
        longitude: longitude || 0,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    zones.push(newZone);
    saveData();
    res.status(201).json(newZone);
};

const updateZone = (req, res) => {
    const id = parseInt(req.params.id);
    const index = zones.findIndex(z => z.id === id);

    if (index === -1) return res.status(404).json({ message: 'Zone not found' });

    zones[index] = {
        ...zones[index],
        ...req.body
    };

    saveData();
    res.json(zones[index]);
};

const deleteZone = (req, res) => {
    const id = parseInt(req.params.id);
    const index = zones.findIndex(z => z.id === id);

    if (index === -1) return res.status(404).json({ message: 'Zone not found' });

    zones.splice(index, 1);
    saveData();
    res.json({ message: 'Zone deleted', id });
};


const toggleZoneStatus = (req, res) => {
    const id = parseInt(req.params.id);
    const zone = zones.find(z => z.id === id);

    if (!zone) return res.status(404).json({ message: 'Zone not found' });

    zone.status = zone.status === 'active' ? 'inactive' : 'active';
    saveData();
    res.json({ message: `Zone status changed to ${zone.status}`, zone });
};

const getZonesByCity = (req, res) => {
    const { city } = req.params;
    const filteredZones = zones.filter(z => z.city.toLowerCase() === city.toLowerCase());
    res.json(filteredZones);
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
