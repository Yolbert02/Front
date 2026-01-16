const { users, officers, saveData } = require('../data/storage');

const getAllUsers = (req, res) => {
    const usersWithoutPasswords = users.map(({ password, ...u }) => u);
    res.json(usersWithoutPasswords);
};

const getUserById = (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
};

const createUser = (req, res) => {
    const { dni, first_name, last_name, email, password, role, phone } = req.body;

    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    const dniExists = users.find(u => u.dni === dni);
    if (dniExists) {
        return res.status(400).json({ message: 'DNI already in use' });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        dni,
        first_name,
        last_name,
        email,
        password,
        role: role || 'civil',
        phone,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    if (newUser.role === 'officer') {
        const newOfficer = {
            id: officers.length > 0 ? Math.max(...officers.map(o => o.id)) + 1 : 1,
            name: first_name,
            lastName: last_name,
            idNumber: dni,
            unit: '',
            email: email,
            phone: phone,
            rank: '',
            status: 'active'
        };
        officers.push(newOfficer);
    }

    saveData();
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
};

const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) return res.status(404).json({ message: 'User not found' });

    const oldDni = users[index].dni;

    users[index] = {
        ...users[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const officerIndex = officers.findIndex(o => o.idNumber === oldDni);
    if (officerIndex !== -1) {
        officers[officerIndex] = {
            ...officers[officerIndex],
            name: req.body.first_name || officers[officerIndex].name,
            lastName: req.body.last_name || officers[officerIndex].lastName,
            idNumber: req.body.dni || officers[officerIndex].idNumber,
            email: req.body.email || officers[officerIndex].email,
            phone: req.body.phone || officers[officerIndex].phone
        };
    }

    saveData();
    const { password: _, ...userWithoutPassword } = users[index];
    res.json(userWithoutPassword);
};

const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) return res.status(404).json({ message: 'User not found' });

    const userDni = users[index].dni;
    users.splice(index, 1);

    const officerIndex = officers.findIndex(o => o.idNumber === userDni);
    if (officerIndex !== -1) {
        officers.splice(officerIndex, 1);
    }

    saveData();
    res.json({ message: 'User and its officer profile deleted successfully', id });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
