require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../../configs/mysqlConnect');
const units = require('../../utils/units');
const { getSource } = require('../models/dashboard_model');
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
  const dashboardId = req.params.dashboardId;
  const {
    timeRange,
    source,
    style,
    interval,
    interval_unit,
    select,
    title,
    fontSize,
    xAxisTitle,
    xAxisFontSize,
    xAxisTickFontSize,
    yAxisTitle,
    yAxisFontSize,
    yAxisTickFontSize,
  } = req.body;
  const database = source.split('/')[0];
  const measurement = source.split('/')[1];

  const layout = {
    title: title,
    titlefont: { size: fontSize },
    xaxis: {
      title: xAxisTitle,
      titlefont: { size: xAxisFontSize },
      tickfont: { size: xAxisTickFontSize },
    },
    yaxis: {
      title: yAxisTitle,
      titlefont: { size: yAxisFontSize },
      tickfont: { size: yAxisTickFontSize },
    },
  };

  let setInterval = interval * units.timeUnits[interval_unit] * 1000;
  setInterval = setInterval < 9999 ? 10000 : setInterval;
  const data = {
    dashboard_id: dashboardId,
    database: database,
    measurement: measurement,
    chart_type: style,
    time_range: timeRange,
    interval: interval,
    interval_unit: interval_unit,
    select: select,
    layout: JSON.stringify(layout),
    setInterval: setInterval,
  };

  db.query(`INSERT INTO chart SET ?`, [data]);
  res.redirect(`/dashboards/${dashboardId}`);
});

router.get('/:dashboardId', async (req, res) => {
  const dashboardId = req.params.dashboardId;
  const [chart] = await db.query(
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
  const [chart] = await db.query(`select * from chart where id = ?`, [chartId]);
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
  const { dashboardId, chartId } = req.params;
  const {
    timeRange,
    source,
    style,
    interval,
    interval_unit,
    select,
    title,
    fontSize,
    xAxisTitle,
    xAxisFontSize,
    xAxisTickFontSize,
    yAxisTitle,
    yAxisFontSize,
    yAxisTickFontSize,
  } = req.body;

  const database = source.split('/')[0];
  const measurement = source.split('/')[1];
  let setInterval = interval * units.timeUnits[interval_unit] * 1000;
  setInterval = setInterval < 9999 ? 10000 : setInterval;

  const layout = {
    title: title,
    titlefont: { size: fontSize },
    xaxis: {
      title: xAxisTitle,
      titlefont: { size: xAxisFontSize },
      tickfont: { size: xAxisTickFontSize },
    },
    yaxis: {
      title: yAxisTitle,
      titlefont: { size: yAxisFontSize },
      tickfont: { size: yAxisTickFontSize },
    },
  };

  const data = {
    dashboard_id: dashboardId,
    database: database,
    measurement: measurement,
    chart_type: style,
    time_range: timeRange,
    interval: interval,
    interval_unit: interval_unit,
    select: select,
    layout: JSON.stringify(layout),
    setInterval: setInterval,
  };
  db.query(`update chart SET ? where id = ?`, [data, chartId]);
  return res.redirect(`/dashboards/${dashboardId}`);
});

router.get('/setting/:id', async (req, res) => {
  return res.render('dashboard_setting');
});

module.exports = router;
