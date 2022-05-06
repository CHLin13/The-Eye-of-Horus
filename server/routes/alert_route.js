const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const alertController = require('../controllers/alert_controller');
const dashboardController = require('../controllers/dashboard_controller');
const { authenticated, authenticatedSuper } = require('../../utils/auth');

router.get('/', authenticated, alertController.getAlertList);
router.get('/create', authenticatedSuper, alertController.getAlertCreate);

router.post(
  '/chart/preview',
  authenticated,
  authenticatedSuper,
  [
    body('timeRange').not().isEmpty(),
    body('source').not().isEmpty(),
    body('interval').not().isEmpty(),
    body('interval_unit').not().isEmpty(),
    body('select').not().isEmpty(),
  ],
  dashboardController.chartPreview
);

router.post(
  '/',
  authenticatedSuper,
  [
    body('name').not().isEmpty(),
    body('source').not().isEmpty(),
    body('select').not().isEmpty(),
    body('condition').not().isEmpty(),
    body('eval_every_input').not().isEmpty(),
    body('eval_for_input').not().isEmpty(),
    body('receiver_id').not().isEmpty(),
    body('message').not().isEmpty(),
  ],
  alertController.postAlert
);
router.get('/:alertId', authenticatedSuper, alertController.getAlert);
router.put(
  '/:alertId',
  authenticatedSuper,
  [
    body('name').not().isEmpty(),
    body('source').not().isEmpty(),
    body('select').not().isEmpty(),
    body('condition').not().isEmpty(),
    body('eval_every_input').not().isEmpty(),
    body('eval_for_input').not().isEmpty(),
    body('receiver_id').not().isEmpty(),
    body('message').not().isEmpty(),
  ],
  alertController.postAlert
);
router.delete('/:alertId', authenticatedSuper, alertController.deleteAlert);

module.exports = router;
