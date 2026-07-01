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
                second_name: true,
                last_name: true,
                second_last_name: true,
                email: true,
                number_phone: true,
                date_birth: true,
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
        const { dni, first_name, second_name, last_name, second_last_name, email, password, role, role_type, date_birth, gender, status } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Find role id
        let targetRole = role_type || role || 'civil';
        if (targetRole === 'officer') targetRole = 'oficial';
        
        const roleRecord = await prisma.roles.findUnique({
            where: { type_rol: targetRole }
        });

        if (!roleRecord) {
            return res.status(400).json({ message: `Role '${targetRole}' not found` });
        }

        // Check if administrator already exists
        if (targetRole === 'administrator') {
            const existingAdmin = await prisma.user.findFirst({
                where: { 
                    Id_rol: roleRecord.Id_rol,
                    status_user: { not: 'deleted' }
                }
            });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Solo puede haber un administrador activo en el sistema.' });
            }
        }

        let finalStatus = status || 'active';
        if (finalStatus === 'inactive') finalStatus = 'suspended';

        const newUser = await prisma.user.create({
            data: {
                dni,
                first_name,
                second_name: second_name || null,
                last_name,
                second_last_name: second_last_name || null,
                email,
                password: hashedPassword,
                date_birth: date_birth ? new Date(date_birth) : new Date('1990-01-01'), // Default if missing
                gender: gender || 'male',
                status_user: finalStatus,
                number_phone: req.body.phone || null,
                Id_rol: roleRecord.Id_rol
            },
            include: { role: true }
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'dato';
            const fieldLabel = field === 'email' ? 'Email' : field === 'dni' ? 'DNI' : field;
            return res.status(400).json({ message: `El ${fieldLabel} ya se encuentra registrado` });
        }
        res.status(400).json({ message: 'Error al crear usuario', error: error.message });
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

        // DNI should not be updated
        delete data.dni;

        // Handle password hashing
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Map role string to Id_rol
        if (data.role || data.role_type) {
            if (requesterRole === 'administrator') {
                let roleName = data.role_type || data.role;
                if (roleName === 'officer') roleName = 'oficial';
                
                const role = await prisma.roles.findUnique({
                    where: { type_rol: roleName }
                });
                if (role) {
                    if (roleName === 'administrator') {
                        const existingAdmin = await prisma.user.findFirst({
                            where: {
                                Id_rol: role.Id_rol,
                                status_user: { not: 'deleted' },
                                Id_user: { not: id } // Exclude the user being updated
                            }
                        });
                        if (existingAdmin) {
                            return res.status(400).json({ message: 'Solo puede haber un administrador activo en el sistema.' });
                        }
                    }
                    data.Id_rol = role.Id_rol;
                }
            }
            delete data.role;
            delete data.role_type;
        }

        // Map frontend fields to backend schema
        if (data.status) {
            let finalStatus = data.status;
            if (finalStatus === 'inactive') finalStatus = 'suspended';
            data.status_user = finalStatus;
            delete data.status;
        }
        if (data.phone) {
            data.number_phone = data.phone;
            delete data.phone;
        }
        if (data.date_birth) {
            data.date_birth = new Date(data.date_birth);
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
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'dato';
            const fieldLabel = field === 'email' ? 'Email' : field === 'dni' ? 'DNI' : field;
            return res.status(400).json({ message: `El ${fieldLabel} ya se encuentra registrado` });
        }
        res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user is a police officer
        const officerProfile = await prisma.police_Officer.findUnique({
            where: { Id_user: id }
        });

        if (officerProfile) {
            // Check if officer is assigned to any active/existing complaints
            const assignedComplaint = await prisma.complaint.findFirst({
                where: { assigned_officer_id: id }
            });

            if (assignedComplaint) {
                return res.status(400).json({
                    message: 'No se puede eliminar el oficial porque tiene denuncias asignadas en el sistema.'
                });
            }

            // Check if officer is assigned to any tribunal assignments
            const assignedAssignment = await prisma.assignment.findFirst({
                where: {
                    officials: {
                        some: { Id_user: id }
                    }
                }
            });

            if (assignedAssignment) {
                return res.status(400).json({
                    message: 'No se puede eliminar el oficial porque está asignado a un juicio u ocurrencia programada.'
                });
            }
        }

        await prisma.user.delete({
            where: { Id_user: id }
        });
        res.json({ message: 'User deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const checkDni = async (req, res) => {
    try {
        const { dni } = req.params;
        if (!dni || dni.trim().length < 3) {
            return res.json({ exists: false });
        }
        const user = await prisma.user.findFirst({
            where: { dni: dni.trim() },
            select: { 
                Id_user: true,
                first_name: true,
                second_name: true,
                last_name: true,
                second_last_name: true
            }
        });
        
        if (user) {
            const fullName = [user.first_name, user.second_name, user.last_name, user.second_last_name]
                .filter(Boolean)
                .join(' ');
            res.json({ exists: true, name: fullName });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Check DNI error:', error);
        res.status(500).json({ message: 'Error checking DNI', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    checkDni
};
