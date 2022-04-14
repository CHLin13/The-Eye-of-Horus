require('dotenv').config();
const express = require('express');
const router = express.Router();
const Influxdb = require('influx');
const influx = new Influxdb.InfluxDB(process.env.URL);

router.get('/', async (req, res) => {
  return res.render('dashboards');
});

router.get('/1/create', async (req, res) => {
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
  // const influxdb = new Influxdb.InfluxDB(process.env.URL + database);
  return res.render('create', { source });
});

router.get('/:id', async (req, res) => {
  return res.render('dashboard_detail');
});

router.get('/setting/:id', async (req, res) => {
  return res.render('dashboard_setting');
});

module.exports = router;
