const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const verifyToken = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

// Admin/Officer global dashboard
router.get('/dashboard', verifyToken, checkRole(['administrator', 'oficial']), statsController.getDashboardStats);
router.get('/reports/excel', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateComplaintsExcel);
router.get('/reports/pdf/:id', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateComplaintPDF);
router.get('/reports/assignment/:id', verifyToken, checkRole(['administrator', 'oficial']), statsController.generateAssignmentPDF);

// Civil personal stats
router.get('/civil-dashboard', verifyToken, checkRole(['civil']), statsController.getCivilStats);

// Officer personal stats
router.get('/officer-dashboard', verifyToken, checkRole(['oficial']), statsController.getOfficerStats);

module.exports = router;
