const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(verifyToken);

router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.get('/city/:city', zoneController.getZonesByCity);

// Restricted to administrators
router.post('/', authorize('administrator'), zoneController.createZone);
router.put('/:id', authorize('administrator'), zoneController.updateZone);
router.delete('/:id', authorize('administrator'), zoneController.deleteZone);
router.patch('/:id/toggle-status', authorize('administrator'), zoneController.toggleZoneStatus);

module.exports = router;
