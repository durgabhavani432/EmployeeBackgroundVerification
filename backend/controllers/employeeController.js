
const db = require('../config/db');

// Add employee
const addEmployee = async (req, res) => {
    try {
        const { name, email, phone, job_role } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO employees
            (name, email, phone, job_role, user_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                phone || null,
                job_role || null,
                req.user.id
            ]
        );

        res.status(201).json({
            message: 'Employee added successfully',
            employeeId: result.insertId
        });

    } catch (error) {
        console.error('Add employee error:', error.message);

        res.status(500).json({
            message: 'Failed to add employee'
        });
    }
};

// Get employees belonging to logged-in user
const getEmployees = async (req, res) => {
    try {
        const [employees] = await db.execute(
            `SELECT * FROM employees
             WHERE user_id = ?
             ORDER BY id DESC`,
            [req.user.id]
        );

        res.json(employees);

    } catch (error) {
        console.error('Get employees error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch employees'
        });
    }
};

// Update employee belonging to logged-in user
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            job_role,
            verification_status
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        const allowedStatuses = [
            'Pending',
            'Verified',
            'Rejected'
        ];

        const status = verification_status || 'Pending';

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid verification status'
            });
        }

        const [result] = await db.execute(
            `UPDATE employees
             SET name = ?,
                 email = ?,
                 phone = ?,
                 job_role = ?,
                 verification_status = ?
             WHERE id = ? AND user_id = ?`,
            [
                name,
                email,
                phone || null,
                job_role || null,
                status,
                id,
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.json({
            message: 'Employee updated successfully'
        });

    } catch (error) {
        console.error('Update employee error:', error.message);

        res.status(500).json({
            message: 'Failed to update employee'
        });
    }
};

// Delete employee belonging to logged-in user
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `DELETE FROM employees
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.json({
            message: 'Employee deleted successfully'
        });

    } catch (error) {
        console.error('Delete employee error:', error.message);

        res.status(500).json({
            message: 'Failed to delete employee'
        });
    }
};

module.exports = {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
};
