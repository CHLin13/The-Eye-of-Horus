const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const dashboardController = require('../controllers/dashboard_controller');

const { authenticated } = require('../../utils/auth');
const { adminRole, editorRole, viewerRole } = require('../../utils/role');

//dashboard
router.get('/', authenticated, dashboardController.getDashboards);

router.get('/create', authenticated, dashboardController.getDashboardCreate);
router.get(
  '/:dashboardId/setting/',
  authenticated,
  adminRole,
  dashboardController.getDashboardSetting
);
router.post(
  '/',
  authenticated,
  adminRole,
  [body('name').notEmpty().isLength({ max: 60 })],
  dashboardController.postDashboard
);

router.put(
  '/:dashboardId',
  authenticated,
  adminRole,
  [body('name').notEmpty().isLength({ max: 60 })],
  dashboardController.postDashboard
);
router.get(
  '/:dashboardId',
  authenticated,
  viewerRole,
  dashboardController.getDashboard
);
router.delete(
  '/:dashboardId',
  authenticated,
  adminRole,
  dashboardController.deleteDashboard
);

//source
router.post(
  '/:dashboardId/chart/preview',
  authenticated,
  viewerRole,
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
  '/type_instance',
  authenticated,
  [body('source').notEmpty()],
  dashboardController.getTypeInstance
);

//chart
router.get(
  '/:dashboardId/create',
  authenticated,
  editorRole,
  dashboardController.getChartCreate
);

router.get(
  '/:dashboardId/chart/:chartId',
  authenticated,
  editorRole,
  dashboardController.getChart
);
router.put(
  '/:dashboardId/chart/:chartId',
  authenticated,
  editorRole,
  [
    body('timeRange').notEmpty(),
    body('source').notEmpty(),
    body('style').notEmpty(),
    body('interval').notEmpty().isInt({ min: 1, max: 2000 }),
    body('interval_unit').notEmpty(),
    body('select').notEmpty(),
    body('title').notEmpty().isLength({ max: 50 }),
    body('fontSize').notEmpty().isInt({ min: 1 }),
  ],
  dashboardController.postChart
);
router.delete(
  '/:dashboardId/chart/:chartId',
  authenticated,
  editorRole,
  dashboardController.deleteChart
);
router.post(
  '/:dashboardId/chart',
  authenticated,
  editorRole,
  [
    body('timeRange').notEmpty(),
    body('source').notEmpty(),
    body('style').notEmpty(),
    body('interval').notEmpty().isInt({ min: 1, max: 2000 }),
    body('interval_unit').notEmpty(),
    body('select').notEmpty(),
    body('title').notEmpty().isLength({ max: 50 }),
    body('fontSize').notEmpty().isInt({ min: 1 }),
  ],
  dashboardController.postChart
);

module.exports = router;
