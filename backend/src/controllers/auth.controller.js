const jwt = require('jsonwebtoken');
const { users } = require('../data/storage');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'Incorrect credentials' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Incorrect credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    login,
    getProfile
};
