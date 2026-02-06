const prisma = require('../config/prisma');

const getAllOfficers = async (req, res) => {
    try {
        const officers = await prisma.police_Officer.findMany({
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        dni: true,
                        profile_picture: true,
                        status_user: true
                    }
                },
                unit: true
            }
        });
        res.json(officers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching officers', error: error.message });
    }
};

const getOfficerById = async (req, res) => {
    try {
        const { id } = req.params;
        const officer = await prisma.police_Officer.findUnique({
            where: { Id_user: id },
            include: { user: true, unit: true }
        });
        if (!officer) return res.status(404).json({ message: 'Officer not found' });
        res.json(officer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching officer', error: error.message });
    }
};

const createOfficer = async (req, res) => {
    // Note: Creating an officer usually requires a valid User first or creating both.
    // In our schema, Police_Officer is a specialization of User.
    try {
        const { Id_user, badge_number, rank, Id_unit } = req.body;

        const newOfficer = await prisma.police_Officer.create({
            data: {
                Id_user,
                badge_number,
                rank,
                Id_unit: parseInt(Id_unit)
            },
            include: { user: true }
        });

        res.status(201).json(newOfficer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating officer', error: error.message });
    }
};

const updateOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.police_Officer.update({
            where: { Id_user: id },
            data: req.body,
            include: { user: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Error updating officer', error: error.message });
    }
};

const deleteOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        // This only deletes the officer profile, not the user unless cascaded in DB (which it is)
        await prisma.police_Officer.delete({
            where: { Id_user: id }
        });
        res.json({ message: 'Officer profile deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting officer', error: error.message });
    }
};

const upgradeOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, Id_unit, rank } = req.body;

        const data = {};
        if (Id_unit) data.Id_unit = parseInt(Id_unit);
        if (rank) data.rank = rank;

        const officer = await prisma.police_Officer.update({
            where: { Id_user: id },
            data,
            include: { user: true }
        });

        if (status) {
            await prisma.user.update({
                where: { Id_user: id },
                data: { status_user: status }
            });
        }

        res.json({ message: 'Officer upgraded successfully', officer });
    } catch (error) {
        res.status(400).json({ message: 'Error upgrading officer', error: error.message });
    }
};

const getOfficerByDni = async (req, res) => {
    try {
        const { dni } = req.params;
        const officer = await prisma.police_Officer.findFirst({
            where: {
                user: { dni: dni }
            },
            include: { user: true, unit: true }
        });
        if (!officer) return res.status(404).json({ message: 'Officer not found by DNI' });
        res.json(officer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching officer by DNI', error: error.message });
    }
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
