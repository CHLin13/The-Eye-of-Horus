const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard_controller');
const { authenticated, getPermission } = require('../../utils/auth');
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
  dashboardController.postDashboard
);
router.put(
  '/:dashboardId',
  authenticated,
  getPermission,
  adminRole,
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
  '/chart/preview',
  authenticated,
  dashboardController.chartPreview
);
router.post(
  '/type_instance',
  authenticated,
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
  dashboardController.postChart
);



module.exports = router;
