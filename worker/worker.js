require('dotenv').config({ path: './.env' });
const redis = require('./configs/redisConnect');
const pool = require('./configs/mysqlConnect');
const Influxdb = require('influx');
const units = require('./utils/units');
const notify = require('./utils/notify');
const {
  checkerMax,
  checkerMin,
  checkerOutside,
  checkerBetween,
  checkerNoValue,
} = require('./utils/checker');

const { INTERVAL, INFLUX_URL, INFLUX_PORT } = process.env;

const work = (async function () {
  try {
    await redis.connect();
    const response = await redis.hGetAll(INTERVAL);
    const result = Object.values(response).map((response) =>
      JSON.parse(response)
    );

    for (let i = 0; i < result.length; i++) {
      const database = result[i].source.split('/')[0];
      const measurement = result[i].source.split('/')[1];
      const influxdb = new Influxdb.InfluxDB(
        `${INFLUX_URL}:${INFLUX_PORT}/${database}`
      );

      const everyArr = result[i].eval_every_input.match(/[a-zA-Z]+|[0-9]+/g);
      const forArr = result[i].eval_for_input.match(/[a-zA-Z]+|[0-9]+/g);
      const limit = Math.floor(
        (forArr[0] * units.timeUnits[forArr[1]]) /
          (everyArr[0] * units.timeUnits[everyArr[1]])
      );

      let influxSql = '';
      if (result[i].type) {
        influxSql = `select ${result[i].select}(*) from ${measurement} WHERE type_instance = '${result[i].type}' GROUP BY time(${result[i].eval_every_input}) order by DESC limit ${limit}`;
      } else {
        influxSql = `select ${result[i].select}(*) from ${measurement} GROUP BY time(${result[i].eval_every_input}) order by DESC limit ${limit}`;
      }

      const system = await influxdb.query(influxSql);
      const select = result[i].select + '_value';

      let checker = null;
      let count = 0;
      switch (Number(result[i].condition)) {
        case 1:
          checker = new checkerMax(result[i].value);
          break;
        case 2:
          checker = new checkerMin(result[i].value);
          break;
        case 3:
          checker = new checkerOutside(result[i].value, result[i].value_max);
          break;
        case 4:
          checker = new checkerBetween(result[i].value, result[i].value_max);
          break;
        case 5:
          checker = new checkerNoValue();
          break;
      }

      for (let j = 0; j < limit; j++) {
        count += checker.check(system[j][select]);
      }

      const detail = JSON.parse(result[i].receiver_detail);

      const errorMessage = result[i].message;

      if (count === limit) {
        notify[result[i].receiver_type](detail[0], errorMessage, detail[1]);
      }

      let status = 0;
      if (count > 0 && count < limit) {
        status = 1;
      } else if (count === limit) {
        status = 2;
      }

      const conn = await pool.getConnection();
      try {
        await conn.query(`UPDATE alert SET status = ? WHERE id = ?`, [
          status,
          result[i].id,
        ]);
      } catch (error) {
        await conn.query('ROLLBACK');
        return { error };
      } finally {
        conn.release();
      }
    }
    await redis.disconnect();
    process.exit();
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
})();

console.log(`${INTERVAL}-working`);
