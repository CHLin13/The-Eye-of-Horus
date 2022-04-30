const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard_controller');
const { authenticated } = require('../../utils/auth');

router.get('/', authenticated, dashboardController.getDashboards);

router.get('/create', authenticated, dashboardController.getDashboardSetting);
router.get('/:dashboardId', authenticated, dashboardController.getDashboard);
router.delete(
  '/:dashboardId',
  authenticated,
  dashboardController.deleteDashboard
);

router.post('/chart/preview', authenticated, dashboardController.chartPreview);
router.post(
  '/type_instance',
  authenticated,
  dashboardController.getTypeInstance
);

router.get(
  '/:dashboardId/create',
  authenticated,
  dashboardController.getChartCreate
);

router.get(
  '/:dashboardId/chart/:chartId',
  authenticated,
  dashboardController.getChart
);
router.put(
  '/:dashboardId/chart/:chartId',
  authenticated,
  dashboardController.postChart
);
router.delete(
  '/:dashboardId/chart/:chartId',
  authenticated,
  dashboardController.deleteChart
);
router.post(
  '/:dashboardId/chart',
  authenticated,
  dashboardController.postChart
);

router.get(
  '/:dashboardId/setting/',
  authenticated,
  dashboardController.getDashboardSetting
);

module.exports = router;
