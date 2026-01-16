const { officers, users, saveData } = require('../data/storage');

const getAllOfficers = (req, res) => {
    res.json(officers);
};

const getOfficerById = (req, res) => {
    const id = parseInt(req.params.id);
    const officer = officers.find(o => o.id === id);
    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    res.json(officer);
};

const createOfficer = (req, res) => {
    const { name, lastName, idNumber, unit, email, phone, rank } = req.body;

    const newOfficer = {
        id: officers.length > 0 ? Math.max(...officers.map(o => o.id)) + 1 : 1,
        name,
        lastName,
        idNumber,
        unit,
        email,
        phone,
        rank,
        status: 'active'
    };

    officers.push(newOfficer);
    saveData();
    res.status(201).json(newOfficer);
};

const updateOfficer = (req, res) => {
    const id = parseInt(req.params.id);
    const index = officers.findIndex(o => o.id === id);

    if (index === -1) return res.status(404).json({ message: 'Officer not found' });

    officers[index] = {
        ...officers[index],
        ...req.body
    };

    saveData();
    res.json(officers[index]);
};

const deleteOfficer = (req, res) => {
    const id = parseInt(req.params.id);
    const index = officers.findIndex(o => o.id === id);

    if (index === -1) return res.status(404).json({ message: 'Officer not found' });

    officers.splice(index, 1);
    saveData();
    res.json({ message: 'Officer deleted', id });
};


const upgradeOfficer = (req, res) => {
    const id = parseInt(req.params.id);
    const { status, unit, rank } = req.body;

    const officer = officers.find(o => o.id === id);
    if (!officer) return res.status(404).json({ message: 'Officer not found' });

    if (status) {
        officer.status = status;
        const user = users.find(u => u.dni === officer.idNumber);
        if (user) {
            user.status = status;
        }
    }

    if (unit) officer.unit = unit;
    if (rank) officer.rank = rank;

    saveData();
    res.json({ message: 'Officer upgraded successfully', officer });
};

const getOfficerByDni = (req, res) => {
    const { dni } = req.params;
    const officer = officers.find(o => o.idNumber === dni);
    if (!officer) return res.status(404).json({ message: 'Officer not found by DNI' });
    res.json(officer);
};

module.exports = {
    getAllOfficers,
    getOfficerById,
    createOfficer,
    updateOfficer,
    deleteOfficer,
    upgradeOfficer,
    getOfficerByDni
};
