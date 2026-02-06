const prisma = require('../config/prisma');

const getAllAssignments = async (req, res) => {
    try {
        const { id, role } = req.user;
        let where = {};

        // RBAC: Logic for viewing assignments if not admin
        if (role !== 'administrator') {
            where = {
                OR: [
                    { id_created_by: id },
                    { judge_id: id },
                    { officials: { some: { Id_user: id } } },
                    { funcionaries: { some: { Id_user: id } } },
                    { witnesses: { some: { Id_user: id } } },
                    { jury: { some: { Id_user: id } } }
                ]
            };
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                judge: { select: { Id_user: true, first_name: true, last_name: true } },
                creator: { select: { Id_user: true, first_name: true, last_name: true } },
                officials: { select: { Id_user: true, first_name: true, last_name: true } },
                funcionaries: { select: { Id_user: true, first_name: true, last_name: true } },
                witnesses: { select: { Id_user: true, first_name: true, last_name: true } },
                jury: { select: { Id_user: true, first_name: true, last_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // Map to front-end format
        const formatted = assignments.map(a => ({
            ...a,
            id: a.Id_assignment,
            judge_name: a.judge ? `${a.judge.first_name} ${a.judge.last_name}` : a.judge_name,
            judge_id: a.judge_id,
            created_by: a.id_created_by,
            officials: a.officials.map(o => ({ id: o.Id_user, name: `${o.first_name} ${o.last_name}` })),
            funcionaries: a.funcionaries.map(f => ({ id: f.Id_user, name: `${f.first_name} ${f.last_name}` })),
            witnesses: a.witnesses.map(w => ({ id: w.Id_user, name: `${w.first_name} ${w.last_name}` })),
            jury: a.jury.map(j => ({ id: j.Id_user, name: `${j.first_name} ${j.last_name}` }))
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
    }
};

const getAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await prisma.assignment.findUnique({
            where: { Id_assignment: id },
            include: {
                judge: true,
                creator: true,
                officials: true,
                funcionaries: true,
                witnesses: true,
                jury: true
            }
        });

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        res.json({
            ...assignment,
            id: assignment.Id_assignment,
            judge_name: assignment.judge ? `${assignment.judge.first_name} ${assignment.judge.last_name}` : assignment.judge_name,
            officials: assignment.officials.map(o => ({ id: o.Id_user, name: `${o.first_name} ${o.last_name}` })),
            funcionaries: assignment.funcionaries.map(f => ({ id: f.Id_user, name: `${f.first_name} ${f.last_name}` })),
            witnesses: assignment.witnesses.map(w => ({ id: w.Id_user, name: `${w.first_name} ${w.last_name}` })),
            jury: assignment.jury.map(j => ({ id: j.Id_user, name: `${j.first_name} ${j.last_name}` }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignment', error: error.message });
    }
};

const createAssignment = async (req, res) => {
    try {
        const { id: creator_id } = req.user;
        let { officials, funcionaries, witnesses, jury, ...body } = req.body;

        // Auto-generate case number if not provided
        if (!body.case_number) {
            body.case_number = `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const data = {
            ...body,
            id_created_by: creator_id
        };

        // Convert dates if present
        if (data.hearing_date && data.hearing_date !== '') data.hearing_date = new Date(data.hearing_date);
        else delete data.hearing_date;

        if (data.trial_date && data.trial_date !== '') data.trial_date = new Date(data.trial_date);
        else delete data.trial_date;

        // Handle relationships
        const connectRoles = {};
        if (officials && officials.length) connectRoles.officials = { connect: officials.map(id => ({ Id_user: id })) };
        if (funcionaries && funcionaries.length) connectRoles.funcionaries = { connect: funcionaries.map(id => ({ Id_user: id })) };
        if (witnesses && witnesses.length) connectRoles.witnesses = { connect: witnesses.map(id => ({ Id_user: id })) };
        if (jury && jury.length) connectRoles.jury = { connect: jury.map(id => ({ Id_user: id })) };

        const newAssignment = await prisma.assignment.create({
            data: { ...data, ...connectRoles },
            include: { judge: true, officials: true, funcionaries: true, witnesses: true, jury: true }
        });

        res.status(201).json({
            ...newAssignment,
            id: newAssignment.Id_assignment
        });
    } catch (error) {
        res.status(400).json({ message: 'Error creating assignment', error: error.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { officials, funcionaries, witnesses, jury, ...body } = req.body;
        const data = { ...body };

        if (data.hearing_date && data.hearing_date !== '') data.hearing_date = new Date(data.hearing_date);
        else delete data.hearing_date;

        if (data.trial_date && data.trial_date !== '') data.trial_date = new Date(data.trial_date);
        else delete data.trial_date;

        // Remove ID from body if present
        delete data.id;
        delete data.Id_assignment;

        // Handle relationships (set overwrites)
        const updateRoles = {};
        if (officials) updateRoles.officials = { set: officials.map(id => ({ Id_user: id })) };
        if (funcionaries) updateRoles.funcionaries = { set: funcionaries.map(id => ({ Id_user: id })) };
        if (witnesses) updateRoles.witnesses = { set: witnesses.map(id => ({ Id_user: id })) };
        if (jury) updateRoles.jury = { set: jury.map(id => ({ Id_user: id })) };

        const updated = await prisma.assignment.update({
            where: { Id_assignment: id },
            data: { ...data, ...updateRoles },
            include: { judge: true, officials: true, funcionaries: true, witnesses: true, jury: true }
        });

        res.json({
            ...updated,
            id: updated.Id_assignment
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating assignment', error: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.assignment.delete({
            where: { Id_assignment: id }
        });
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
