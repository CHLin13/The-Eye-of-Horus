const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alert_controller');
const dashboardController = require('../controllers/dashboard_controller')
const { authenticated, authenticatedSuper } = require('../../utils/auth');

router.get('/', authenticated, alertController.getAlertList);
router.get('/create', authenticatedSuper, alertController.getAlertCreate);

router.post(
  '/chart/preview',
  authenticated,
  authenticatedSuper,
  dashboardController.chartPreview
);
router.post('/', authenticatedSuper, alertController.postAlert);
router.get('/:alertId', authenticatedSuper, alertController.getAlert);
router.put('/:alertId', authenticatedSuper, alertController.postAlert);
router.delete('/:alertId', authenticatedSuper, alertController.deleteAlert);

module.exports = router;
