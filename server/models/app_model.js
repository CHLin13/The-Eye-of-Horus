require('dotenv').config();
const Influxdb = require('influx');
const database = 'App';
const { INFLUX_URL, INFLUX_PORT } = process.env;
const influx = new Influxdb.InfluxDB(
  `${INFLUX_URL}:${INFLUX_PORT}/${database}`
);

const appModel = {
  postData: async (req) => {
    const ip =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const { timestamp, name, value } = req.body;
    const measurement = `${name}(${ip.slice(7)})`;
    const database = await influx.query('SHOW DATABASES');
    const databaseApp = database
      .map((database) => database.name)
      .find((name) => name === 'App');
    try {
      if (!databaseApp) {
        await influx.query('CREATE DATABASE App');
      }
      await influx.writePoints([
        {
          timestamp: timestamp,
          measurement: measurement,
          tags: { host: ip.slice(7) },
          fields: { value: value },
        },
      ]);
      return true;
    } catch (error) {
      return { error };
    }
  },
};

module.exports = appModel;
