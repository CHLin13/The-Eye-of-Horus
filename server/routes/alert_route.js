const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alert_controller');

router.get('/', alertController.getAlertList);

router.get('/create', alertController.getAlertCreate);

router.post('/', alertController.postAlert);
router.get('/:alertId', alertController.getAlert);
router.put('/:alertId', alertController.postAlert);
router.delete('/:alertId', alertController.deleteAlert);

module.exports = router;
