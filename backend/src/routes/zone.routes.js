const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');

router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.put('/:id', zoneController.updateZone);
router.delete('/:id', zoneController.deleteZone);

router.patch('/:id/toggle-status', zoneController.toggleZoneStatus);
router.get('/city/:city', zoneController.getZonesByCity);

module.exports = router;
