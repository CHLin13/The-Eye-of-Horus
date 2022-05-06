const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const dashboardController = require('../controllers/dashboard_controller');
const {
  authenticated,
  getPermission,
} = require('../../utils/auth');
const { adminRole, editorRole, viewerRole } = require('../../utils/role');

//dashboard
router.get('/', authenticated, dashboardController.getDashboards);

router.get(
  '/create',
  authenticated,
  getPermission,
  adminRole,
  dashboardController.getDashboardSetting
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
  [
    body('name').not().isEmpty(),
    body('roleId').not().isEmpty(),
    body('permission').not().isEmpty(),
  ],
  dashboardController.postDashboard
);

router.put(
  '/:dashboardId',
  authenticated,
  getPermission,
  adminRole,
  [
    body('name').not().isEmpty(),
    body('roleId').not().isEmpty(),
    body('permission').not().isEmpty(),
  ],
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
    body('timeRange').not().isEmpty(),
    body('source').not().isEmpty(),
    body('interval').not().isEmpty(),
    body('interval_unit').not().isEmpty(),
    body('select').not().isEmpty(),
  ],
  dashboardController.chartPreview
);
router.post(
  '/type_instance',
  authenticated,
  [
    body('source').not().isEmpty(),
  ],
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
    body('timeRange').not().isEmpty(),
    body('source').not().isEmpty(),
    body('style').not().isEmpty(),
    body('interval').not().isEmpty(),
    body('interval_unit').not().isEmpty(),
    body('select').not().isEmpty(),
    body('title').not().isEmpty(),
    body('fontSize').not().isEmpty(),
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
    body('timeRange').not().isEmpty(),
    body('source').not().isEmpty(),
    body('style').not().isEmpty(),
    body('interval').not().isEmpty(),
    body('interval_unit').not().isEmpty(),
    body('select').not().isEmpty(),
    body('title').not().isEmpty(),
    body('fontSize').not().isEmpty(),
  ],
  dashboardController.postChart
);

module.exports = router;
