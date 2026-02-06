const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { complaintSchema, evidenceSchema } = require('../validators/complaintSchema');

router.use(verifyToken);

router.get('/', complaintController.getAllComplaints);
router.get('/:id', complaintController.getComplaintById);
router.post('/', validate(complaintSchema), complaintController.createComplaint);
router.put('/:id', authorize(['administrator', 'oficial']), complaintController.updateComplaint);
router.delete('/:id', authorize('administrator'), complaintController.deleteComplaint);

// Sensitive operations restricted to authorities
router.patch('/:id/assign', authorize('administrator'), complaintController.assignOfficer);
router.patch('/:id/priority', authorize('administrator'), complaintController.updatePriority);
router.post('/:id/evidence', authorize(['administrator', 'oficial']), validate(evidenceSchema), complaintController.addEvidence);

module.exports = router;
