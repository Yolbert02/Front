const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officer.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public to all authenticated users (including civil)
router.get('/', verifyToken, officerController.getAllOfficers);
router.get('/:id', verifyToken, officerController.getOfficerById);
router.get('/dni/:dni', verifyToken, officerController.getOfficerByDni);

const validate = require('../middleware/validate.middleware');
const { oficialSchema } = require('../validators/userSchema');

// Restricted to administrators
router.post('/', verifyToken, authorize('administrator'), validate(oficialSchema), officerController.createOfficer);
router.put('/:id', verifyToken, authorize('administrator'), validate(oficialSchema.partial()), officerController.updateOfficer);
router.delete('/:id', verifyToken, authorize('administrator'), officerController.deleteOfficer);
router.patch('/:id/upgrade', verifyToken, authorize('administrator'), officerController.upgradeOfficer);

module.exports = router;
