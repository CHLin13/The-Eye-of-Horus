require('dotenv').config();
const redis = require('./configs/redisConnect');
const Influxdb = require('influx');
const units = require('./utils/units');

const work = (async function () {
  const response = await redis.hGetAll('1m');
  const result = Object.values(response).map((response) =>
    JSON.parse(response)
  );

  for (let i = 0; i < result.length; i++) {
    const database = result[i].source.split('/')[0];
    const measurement = result[i].source.split('/')[1];
    const influxdb = new Influxdb.InfluxDB(process.env.URL + database);

    const everyArr = result[i].eval_every_input.match(/[a-zA-Z]+|[0-9]+/g);
    const forArr = result[i].eval_for_input.match(/[a-zA-Z]+|[0-9]+/g);
    const limit = Math.floor(
      (forArr[0] * units.timeUnits[forArr[1]]) /
        (everyArr[0] * units.timeUnits[everyArr[1]])
    );

    const system = await influxdb.query(
      `select ${result[i].select}(*) from ${measurement} WHERE type_instance = '${result[i].type}' GROUP BY time(${result[i].eval_every_input}) order by DESC limit ${limit}`
    );

    const select = result[i].select + '_value';
    let count = 0;
    for (let j = 0; j < limit; j++) {
      switch (Number(result[i].condition)) {
        case 1:
          system[j][select] > result[i].value ? count++ : (count += 0);
          break;
        case 2:
          system[j][select] < result[i].value ? count++ : (count += 0);
          break;
        case 3:
          system[j][select] < result[i].value ||
          system[j][select] > result[i].value_max
            ? count++
            : (count += 0);
          break;
        case 4:
          system[j][select] > result[i].value &&
          system[j][select] < result[i].value_max
            ? count++
            : (count += 0);
          break;
        case 5:
          system[j][select] === null ? count++ : (count += 0);
          break;
      }

      if (count === 5) {
      console.log(result[i].message);
      }
    }
  }
})();

console.log('working');
