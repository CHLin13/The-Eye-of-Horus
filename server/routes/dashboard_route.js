require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../configs/mysqlConnect');
const units = require('../../utils/units');
const {
  getSource,
  postChart,
  getChartDetail,
  getCharts,
  previewChart,
} = require('../models/dashboard_model');
const Influxdb = require('influx');

router.get('/', async (req, res) => {
  return res.render('dashboards');
});

router.post('/chart/preview', async (req, res) => {
  const data = await previewChart(req);
  return res.json({ data: data, select: req.body.select });
});

router.get('/:dashboardId/create', async (req, res) => {
  const dashboardId = req.params.dashboardId;
  const source = await getSource();
  return res.render('create', { source, dashboardId });
});

router.post('/:dashboardId/create', async (req, res) => {
  postChart(req);
  return res.redirect(`/dashboards/${req.params.dashboardId}`);
});

router.get('/:dashboardId', async (req, res) => {
  const dashboardId = req.params.dashboardId;
  const chart = await getCharts(dashboardId);
  return res.render('dashboard_detail', { chart });
});

router.get('/:dashboardId/chart/:chartId', async (req, res) => {
  const { dashboardId, chartId } = req.params;
  const data = await getChartDetail(dashboardId, chartId);
  const source = await getSource();
  return res.render('create', { data, source });
});

router.post('/:dashboardId/chart/:chartId', async (req, res) => {
  postChart(req);
  return res.redirect(`/dashboards/${req.params.dashboardId}`);
});

router.get('/setting/:id', async (req, res) => {
  return res.render('dashboard_setting');
});

module.exports = router;
