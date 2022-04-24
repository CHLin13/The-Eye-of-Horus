require('dotenv').config();
const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard_controller');

router.get('/', dashboardController.getDashboardList);
router.get('/:dashboardId', dashboardController.getDashboardDetail);

router.post('/chart/preview', dashboardController.chartPreview);

router.get('/:dashboardId/create', dashboardController.getDashboardCreate);
router.post('/:dashboardId/create', dashboardController.postDashboardCreate);

router.get('/:dashboardId/chart/:chartId', dashboardController.getChartDetail);
router.put('/:dashboardId/chart/:chartId', dashboardController.putChart);
router.delete('/:dashboardId/chart/:chartId', dashboardController.deleteChart);

router.get('/setting/:id', dashboardController.getDashboardSetting);

router.post('/type_instance', dashboardController.getTypeInstance);

module.exports = router;
