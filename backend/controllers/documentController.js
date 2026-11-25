
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Check whether employee belongs to logged-in user
const checkEmployeeOwnership = async (employeeId, userId) => {
    const [employees] = await db.execute(
        `SELECT id FROM employees
         WHERE id = ? AND user_id = ?`,
        [employeeId, userId]
    );

    return employees.length > 0;
};

// Upload employee document
const uploadDocument = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { documentName } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: 'Please select a document.'
            });
        }

        if (!documentName) {
            fs.unlinkSync(req.file.path);

            return res.status(400).json({
                message: 'Document name is required.'
            });
        }

        const isOwner = await checkEmployeeOwnership(
            employeeId,
            req.user.id
        );

        if (!isOwner) {
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                message: 'Employee not found.'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO employee_documents
            (employee_id, document_name, file_name, file_path)
            VALUES (?, ?, ?, ?)`,
            [
                employeeId,
                documentName,
                req.file.originalname,
                req.file.filename
            ]
        );

        res.status(201).json({
            message: 'Document uploaded successfully!',
            documentId: result.insertId
        });

    } catch (error) {
        console.error('Document upload error:', error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: 'Unable to upload document.'
        });
    }
};

// Get employee documents
const getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const isOwner = await checkEmployeeOwnership(
            employeeId,
            req.user.id
        );

        if (!isOwner) {
            return res.status(404).json({
                message: 'Employee not found.'
            });
        }

        const [documents] = await db.execute(
            `SELECT id, employee_id, document_name,
             file_name, uploaded_at
             FROM employee_documents
             WHERE employee_id = ?
             ORDER BY uploaded_at DESC`,
            [employeeId]
        );

        res.json(documents);

    } catch (error) {
        console.error('Get documents error:', error);

        res.status(500).json({
            message: 'Unable to fetch documents.'
        });
    }
};

// Download employee document
const downloadDocument = async (req, res) => {
    try {
        const { employeeId, documentId } = req.params;

        const [documents] = await db.execute(
            `SELECT d.file_name, d.file_path
             FROM employee_documents d
             INNER JOIN employees e
             ON d.employee_id = e.id
             WHERE d.id = ?
             AND d.employee_id = ?
             AND e.user_id = ?`,
            [documentId, employeeId, req.user.id]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                message: 'Document not found.'
            });
        }

        const filePath = path.join(
            __dirname,
            '..',
            'uploads',
            documents[0].file_path
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: 'Document file not found.'
            });
        }

        res.download(filePath, documents[0].file_name);

    } catch (error) {
        console.error('Download error:', error);

        res.status(500).json({
            message: 'Unable to download document.'
        });
    }
};

module.exports = {
    uploadDocument,
    getEmployeeDocuments,
    downloadDocument
};
