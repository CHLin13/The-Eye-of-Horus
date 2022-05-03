const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alert_controller');
const { authenticated } = require('../../utils/auth');

router.get('/', authenticated, alertController.getAlertList);
router.get('/create', authenticated, alertController.getAlertCreate);

router.post('/', authenticated, alertController.postAlert);
router.get('/:alertId', authenticated, alertController.getAlert);
router.put('/:alertId', authenticated, alertController.postAlert);
router.delete('/:alertId', authenticated, alertController.deleteAlert);

module.exports = router;
