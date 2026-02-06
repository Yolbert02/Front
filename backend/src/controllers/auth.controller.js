const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const crypto = require('crypto');
const { sendEmail } = require('../services/email.service');

const login = async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    console.log(`Intento de login para: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
                officer: true
            }
        });

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`User found: ${user.first_name}. Role: ${user.role.type_rol}`);

        if (user.status_user !== 'active') {
            console.log(`User not active: ${user.status_user}`);
            return res.status(403).json({ success: false, message: 'User is not active' });
        }

        let isMatch = false;
        if (user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Support for legacy/SQL-inserted plain text passwords
            isMatch = (password === user.password);
        }

        console.log(`Password comparison result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: user.Id_user,
                email: user.email,
                role: user.role.type_rol
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        // Prepare object for frontend
        const userResponse = {
            id: user.Id_user,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role.type_rol,
            dni: user.dni,
            avatar: user.profile_picture
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { Id_user: userId },
            include: { role: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            user: {
                ...userWithoutPassword,
                role: user.role.type_rol,
                id: user.Id_user,
                avatar: user.profile_picture
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email does not exist' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { email },
            data: {
                reset_token: token,
                reset_token_expires: expires
            }
        });

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

        await sendEmail(
            email,
            'Password Recovery',
            `You requested to reset your password. Click the following link: ${resetUrl}`,
            `<p>You requested to reset your password.</p><p>Click the following link to continue:</p><a href="${resetUrl}">${resetUrl}</a>`
        );

        res.json({ success: true, message: 'Recovery email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                reset_token: token,
                reset_token_expires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { Id_user: user.Id_user },
            data: {
                password: hashedPassword,
                reset_token: null,
                reset_token_expires: null
            }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { Id_user: userId } });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { Id_user: userId },
            data: { password: hashedPassword }
        });

        res.json({ success: true, message: 'Password successfully updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
};

module.exports = {
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword
};
