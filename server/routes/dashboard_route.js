require('dotenv').config();
const express = require('express');
const router = express.Router();
const Influxdb = require('influx');
const influx = new Influxdb.InfluxDB(process.env.URL);

router.get('/', async (req, res) => {
  return res.render('dashboards');
});

router.post('/chart/preview', async (req, res) => {
  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
    M: 30 * 24 * 60 * 60,
    y: 365 * 30 * 24 * 60 * 60,
  };

  const { timeRange, source, interval, interval_unit, select } = req.body;
  const database = source.split('/')[0];
  const measurement = source.split('/')[1];
  const influxdb = new Influxdb.InfluxDB(process.env.URL + database);

  const intervalN = interval * units[interval_unit];
  const rangeIntoSec = timeRange.split('-')[0] * units[timeRange.split('-')[1]];
  const limit = Math.floor(rangeIntoSec / intervalN);

  const system = await influxdb.query(
    `select ${select}(*) from ${measurement} GROUP BY type_instance, time(${interval}${interval_unit}) order by DESC limit ${limit}`
  );
  const data = system.groupRows;
  return res.json({ data: data, select: select });
});

router.get('/:id/create', async (req, res) => {
  const db = await influx.getDatabaseNames();
  const newDB = db.slice(1);
  const measurements = [];
  for (let i = 0; i < newDB.length; i++) {
    const measurement = await influx.getMeasurements(newDB[i]);
    measurements.push(measurement);
  }
  let source = [];
  for (let i = 0; i < newDB.length; i++) {
    source.push(
      measurements[i].map((measurement) => newDB[i] + '/' + measurement)
    );
  }
  source = source.flat();
  return res.render('create', { source });
});

router.get('/:id', async (req, res) => {
  return res.render('dashboard_detail');
});

router.get('/setting/:id', async (req, res) => {
  return res.render('dashboard_setting');
});

module.exports = router;
