
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
    uploadDocument,
    getEmployeeDocuments,
    downloadDocument
} = require('../controllers/documentController');

router.post(
    '/:employeeId/documents',
    authMiddleware,
    upload.single('document'),
    uploadDocument
);

router.get(
    '/:employeeId/documents',
    authMiddleware,
    getEmployeeDocuments
);

router.get('/test', (req, res) => {
    res.send('Document routes working!');
});

module.exports = router;
