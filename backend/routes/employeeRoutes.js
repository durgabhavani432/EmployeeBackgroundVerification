
const express = require('express');
const router = express.Router();

const {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const authMiddleware = require('../middleware/authMiddleware');

// Add employee
router.post('/', authMiddleware, addEmployee);

// Get all employees
router.get('/', authMiddleware, getEmployees);

// Update employee
router.put('/:id', authMiddleware, updateEmployee);

// Delete employee
router.delete('/:id', authMiddleware, deleteEmployee);

module.exports = router;
