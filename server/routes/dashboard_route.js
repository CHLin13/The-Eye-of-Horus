const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const dashboardController = require('../controllers/dashboard_controller');
const { authenticated, getPermission } = require('../../utils/auth');
const { adminRole, editorRole, viewerRole } = require('../../utils/role');

//dashboard
router.get('/', authenticated, dashboardController.getDashboards);

router.get(
  '/create',
  authenticated,
  dashboardController.getDashboardCreate
);
router.get(
  '/:dashboardId/setting/',
  authenticated,
  getPermission,
  adminRole,
  dashboardController.getDashboardSetting
);
router.post(
  '/',
  authenticated,
  getPermission,
  adminRole,
  [body('name').notEmpty()],
  dashboardController.postDashboard
);

router.put(
  '/:dashboardId',
  authenticated,
  getPermission,
  adminRole,
  [body('name').notEmpty()],
  dashboardController.postDashboard
);
router.get(
  '/:dashboardId',
  authenticated,
  getPermission,
  viewerRole,
  dashboardController.getDashboard
);
router.delete(
  '/:dashboardId',
  authenticated,
  getPermission,
  adminRole,
  dashboardController.deleteDashboard
);

//source
router.post(
  '/:dashboardId/chart/preview',
  authenticated,
  getPermission,
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
  getPermission,
  editorRole,
  dashboardController.getChartCreate
);

router.get(
  '/:dashboardId/chart/:chartId',
  authenticated,
  getPermission,
  editorRole,
  dashboardController.getChart
);
router.put(
  '/:dashboardId/chart/:chartId',
  authenticated,
  getPermission,
  editorRole,
  [
    body('timeRange').notEmpty(),
    body('source').notEmpty(),
    body('style').notEmpty(),
    body('interval').notEmpty().isInt({ min: 1, max: 2000 }),
    body('interval_unit').notEmpty(),
    body('select').notEmpty(),
    body('title').notEmpty(),
    body('fontSize').notEmpty(),
  ],
  dashboardController.postChart
);
router.delete(
  '/:dashboardId/chart/:chartId',
  authenticated,
  getPermission,
  editorRole,
  dashboardController.deleteChart
);
router.post(
  '/:dashboardId/chart',
  authenticated,
  getPermission,
  editorRole,
  [
    body('timeRange').notEmpty(),
    body('source').notEmpty(),
    body('style').notEmpty(),
    body('interval').notEmpty().isInt({ min: 1, max: 2000 }),
    body('interval_unit').notEmpty(),
    body('select').notEmpty(),
    body('title').notEmpty(),
    body('fontSize').notEmpty(),
  ],
  dashboardController.postChart
);

module.exports = router;
