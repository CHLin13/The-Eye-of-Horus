require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../configs/mysqlConnect');
const units = require('../../utils/units');
const { getSource, postChart } = require('../models/dashboard_model');
const Influxdb = require('influx');

router.get('/', async (req, res) => {
  return res.render('dashboards');
});

router.post('/chart/preview', async (req, res) => {
  const { timeRange, source, interval, interval_unit, select } = req.body;
  const database = source.split('/')[0];
  const measurement = source.split('/')[1];
  const influxdb = new Influxdb.InfluxDB(process.env.URL + database);

  const intervalN = interval * units.timeUnits[interval_unit];
  const rangeIntoSec =
    timeRange.split('-')[0] * units.timeUnits[timeRange.split('-')[1]];
  const limit = Math.floor(rangeIntoSec / intervalN);

  const system = await influxdb.query(
    `select ${select}(*) from ${measurement} GROUP BY type_instance, time(${interval}${interval_unit}) order by DESC limit ${limit}`
  );
  const data = system.groupRows;
  return res.json({ data: data, select: select });
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
  const [chart] = await pool.query(
    `select * from dashboard inner join chart on chart.dashboard_id = dashboard.id where chart.dashboard_id = ?`,
    [dashboardId]
  );

  for (let i = 0; i < chart.length; i++) {
    chart[i].dashboardId = dashboardId;
  }

  return res.render('dashboard_detail', { chart });
});

router.get('/:dashboardId/chart/:chartId', async (req, res) => {
  const { dashboardId, chartId } = req.params;
  const source = await getSource();
  const [chart] = await pool.query(`select * from chart where id = ?`, [chartId]);
  const layout = JSON.parse(chart[0].layout);
  const data = {
    dashboardId: dashboardId,
    chartId: chartId,
    title: layout.title,
    titleFontSize: layout.titlefont.size,
    timeRange: chart[0].time_range,
    source: chart[0].database + '/' + chart[0].measurement,
    style: chart[0].chart_type,
    interval: chart[0].interval,
    interval_unit: chart[0].interval_unit,
    select: chart[0].select,
    xAxisTitle: layout.xaxis.title,
    xAxisFontSize: layout.xaxis.titlefont.size,
    xAxisTickFontSize: layout.xaxis.tickfont.size,
    yAxisTitle: layout.yaxis.title,
    yAxisFontSize: layout.yaxis.titlefont.size,
    yAxisTickFontSize: layout.yaxis.tickfont.size,
  };

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
