const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const verifyToken = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

// All stats routes are protected and for admin/officer
router.get('/dashboard', verifyToken, checkRole(['administrator', 'oficial']), statsController.getDashboardStats);
router.get('/reports/excel', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateComplaintsExcel);
router.get('/reports/pdf/:id', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateComplaintPDF);
router.get('/reports/assignment/:id', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateAssignmentPDF);

module.exports = router;
