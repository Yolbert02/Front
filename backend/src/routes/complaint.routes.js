const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');

router.get('/', complaintController.getAllComplaints);
router.get('/:id', complaintController.getComplaintById);
router.post('/', complaintController.createComplaint);
router.put('/:id', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);

router.patch('/:id/assign', complaintController.assignOfficer);
router.patch('/:id/priority', complaintController.updatePriority);
router.post('/:id/evidence', complaintController.addEvidence);

module.exports = router;
