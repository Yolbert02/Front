const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Backend is running correctly' });
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const officerRoutes = require('./routes/officer.routes');
const complaintRoutes = require('./routes/complaint.routes');
const zoneRoutes = require('./routes/zone.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/zones', zoneRoutes);

module.exports = app;
