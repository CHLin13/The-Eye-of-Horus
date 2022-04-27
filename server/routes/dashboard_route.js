const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard_controller');

router.get('/', dashboardController.getDashboards);
router.get('/:dashboardId', dashboardController.getDashboard);
router.delete('/:dashboardId', dashboardController.deleteDashboard);

router.post('/chart/preview', dashboardController.chartPreview);
router.post('/type_instance', dashboardController.getTypeInstance);

router.get('/:dashboardId/create', dashboardController.getDashboardCreate);

router.get('/:dashboardId/chart/:chartId', dashboardController.getChart);
router.put('/:dashboardId/chart/:chartId', dashboardController.postChart);
router.delete('/:dashboardId/chart/:chartId', dashboardController.deleteChart);
router.post('/:dashboardId/chart', dashboardController.postChart);

router.get('/setting/:id', dashboardController.getDashboardSetting);

module.exports = router;
