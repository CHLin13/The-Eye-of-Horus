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
  authenticatedSuper,
  [
    body('timeRange').notEmpty(),
    body('source').notEmpty(),
    body('interval').notEmpty().isInt({ min: 1, max: 2000 }),
    body('interval_unit').notEmpty(),
    body('select').notEmpty(),
  ],
  dashboardController.chartPreview
);

router.post(
  '/',
  authenticatedSuper,
  [
    body('name').notEmpty().isLength({ max: 50 }),
    body('source').notEmpty(),
    body('select').notEmpty(),
    body('condition').notEmpty(),
    body('eval_every_input').notEmpty(),
    body('eval_for_input').notEmpty(),
    body('receiver_id').notEmpty(),
    body('message').notEmpty().isLength({ max: 256 }),
  ],
  alertController.postAlert
);
router.get('/:alertId', authenticatedSuper, alertController.getAlert);
router.put(
  '/:alertId',
  authenticatedSuper,
  [
    body('name').notEmpty(),
    body('source').notEmpty(),
    body('select').notEmpty(),
    body('condition').notEmpty(),
    body('eval_every_input').notEmpty(),
    body('eval_for_input').notEmpty(),
    body('receiver_id').notEmpty(),
    body('message').notEmpty(),
  ],
  alertController.postAlert
);
router.delete('/:alertId', authenticatedSuper, alertController.deleteAlert);

module.exports = router;
