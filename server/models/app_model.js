require('dotenv').config();
const Influxdb = require('influx');
const database = 'App';
const influx = new Influxdb.InfluxDB(process.env.URL + database);

const appModel = {
  postData: async (req) => {
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
          measurement: name,
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
