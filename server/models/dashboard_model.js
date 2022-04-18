const pool = require('../../configs/mysqlConnect');
const units = require('../../utils/units');
const Influxdb = require('influx');
const influx = new Influxdb.InfluxDB(process.env.URL);

const getSource = async () => {
  const idb = await influx.getDatabaseNames();
  const newDB = idb.slice(1);
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
  return source;
};

const postChart = async (req) => {
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

  const conn = await pool.getConnection();
  try {
    if (chartId) {
      conn.query(`UPDATE chart SET ? WHERE id = ?`, [data, chartId]);
    } else {
      conn.query(`INSERT INTO chart SET ?`, [data]);
    }
    await conn.query('COMMIT');
    return true;
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

module.exports = {
  getSource,
  postChart,
};
