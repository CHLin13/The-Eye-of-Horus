require('dotenv').config();
const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alert_controller');

router.get('/', alertController.getAlertList);

router.get('/create', alertController.getAlertCreate);
router.post('/create', alertController.postAlertCreate);

router.get('/:alertId', alertController.getAlert);
router.put('/:alertId', alertController.putAlert);

module.exports = router;
