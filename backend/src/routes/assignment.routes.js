const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All routes are protected
router.use(verifyToken);

router.get('/', assignmentController.getAllAssignments);
router.get('/:id', assignmentController.getAssignmentById);

const validate = require('../middleware/validate.middleware');
const { assignmentSchema } = require('../validators/assignmentSchema');

// Manager/Admin routes
router.post('/', authorize('administrator'), validate(assignmentSchema), assignmentController.createAssignment);
router.put('/:id', authorize('administrator'), validate(assignmentSchema.partial()), assignmentController.updateAssignment);
router.delete('/:id', authorize('administrator'), assignmentController.deleteAssignment);

module.exports = router;
