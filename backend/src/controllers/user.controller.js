const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    console.log("GET /api/users called by user:", req.user);
    try {
        const users = await prisma.user.findMany({
            select: {
                Id_user: true,
                dni: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_picture: true,
                status_user: true,
                role: true,
                created_at: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { Id_user: id },
            include: { role: true, officer: true }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { dni, first_name, last_name, email, password, role_type, date_birth, gender } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Find role id
        const role = await prisma.roles.findUnique({
            where: { type_rol: role_type || 'civil' }
        });

        const newUser = await prisma.user.create({
            data: {
                dni,
                first_name,
                last_name,
                email,
                password: hashedPassword,
                date_birth: new Date(date_birth),
                gender: gender || 'male',
                Id_rol: role.Id_rol
            },
            include: { role: true }
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: requesterId, role: requesterRole } = req.user;

        // RBAC: Only self or admin
        if (requesterRole !== 'administrator' && requesterId !== id) {
            return res.status(403).json({ message: 'You do not have permission to update this user' });
        }

        let data = { ...req.body };

        // Handle password hashing
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Map role string to Id_rol
        if (data.role || data.role_type) {
            if (requesterRole === 'administrator') {
                const roleName = data.role_type || data.role;
                const role = await prisma.roles.findUnique({
                    where: { type_rol: roleName }
                });
                if (role) {
                    data.Id_rol = role.Id_rol;
                }
            }
            delete data.role;
            delete data.role_type;
        }

        // Map frontend fields to backend schema
        if (data.status) {
            data.status_user = data.status;
            delete data.status;
        }
        if (data.phone) {
            data.number_phone = data.phone;
            delete data.phone;
        }

        // Remove sensitive fields if not admin
        if (requesterRole !== 'administrator') {
            delete data.Id_rol;
            delete data.status_user;
        }

        const updatedUser = await prisma.user.update({
            where: { Id_user: id },
            data,
            include: { role: true }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { Id_user: id }
        });
        res.json({ message: 'User deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
