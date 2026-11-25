console.log("MY BACKEND SERVER FILE IS RUNNING");
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', documentRoutes);
app.get('/api/employees/test', (req, res) => {
    res.send('Document route registered successfully!');
});

// Test routes
app.get('/', (req, res) => {
    res.send('Employee Background Check API is running!');
});

app.get('/db-test', async (req, res) => {
    try {
        const db = require('./config/db');
        const [result] = await db.query('SELECT 1 AS result');

        res.json({
            message: 'MySQL connected successfully!',
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Database connection failed'
        });
    }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Express server is listening...');
});

server.on('error', (error) => {
    console.error('Server startup error:', error);
});