require('dotenv').config();
const Influxdb = require('influx');
const database = 'App';
const influx = new Influxdb.InfluxDB(process.env.URL + database);

const appModel = {
  postData: async (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const measurement = `${name}(${ip.slice(7)})`
    const { timestamp, host, name, value } = req.body;
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
          tags: { host: host },
          fields: { value: value },
        },
      ]);
      return;
    } catch (error) {
      return { error };
    }
  },
};

module.exports = appModel;
