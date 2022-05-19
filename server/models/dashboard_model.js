require('dotenv').config();
const pool = require('../../configs/mysqlConnect');
const units = require('../../utils/units');
const Influxdb = require('influx');
const { INFLUX_URL, INFLUX_PORT } = process.env;
const influx = new Influxdb.InfluxDB(`${INFLUX_URL}:${INFLUX_PORT}/`);

const dashboardModel = {
  getDashboards: async () => {
    let sql =
      'SELECT DISTINCT dashboard.* , dashboard_permission.role_id, dashboard_permission.permission FROM dashboard LEFT JOIN dashboard_permission ON dashboard.id = dashboard_permission.dashboard_id';
    let [dashboards] = await pool.query(sql);

    //Integrate role id and permission into an array
    dashboards = dashboards
      .reduce((accu, curr) => {
        if (!accu[curr.id]) {
          accu[curr.id] = curr;
          accu[curr.id].role_id = [curr.role_id];
          accu[curr.id].permission = [curr.permission];
        } else {
          accu[curr.id].role_id.push(curr.role_id);
          accu[curr.id].permission.push(curr.permission);
        }
        return accu;
      }, [])
      //filter out no-permission dashboard
      .filter((item) => {
        return item !== null;
      });

    return dashboards;
  },

  getDashboard: async (dashboardId) => {
    let sql =
      'SELECT dashboard.* , dashboard_permission.role_id,dashboard_permission.permission FROM dashboard LEFT JOIN dashboard_permission ON dashboard.id = dashboard_permission.dashboard_id WHERE dashboard.id = ?';
    const [dashboard] = await pool.query(sql, [dashboardId]);
    if (isNaN(dashboardId) || dashboard.length === 0) {
      return false;
    }

    //Integrate role id and permission into an array
    dashboard[0].role_id = dashboard.map((dashboard) => dashboard.role_id);
    dashboard[0].permission = dashboard.map(
      (dashboard) => dashboard.permission
    );
    dashboard.splice(1);
    return dashboard;
  },

  postDashboard: async (name, roleId, permission, dashboardId) => {
    const conn = await pool.getConnection();
    try {
      if (dashboardId) {
        //update dashboard name and flush all permission
        await conn.query('UPDATE dashboard SET ? WHERE id = ?', [
          { name: name },
          dashboardId,
        ]);
        await conn.query(
          'DELETE FROM dashboard_permission WHERE dashboard_id = ?',
          [dashboardId]
        );
      } else {
        const [dashboard] = await conn.query('INSERT INTO dashboard SET ?', [
          { name: name },
        ]);
        dashboardId = dashboard.insertId;
      }

      //Integrate role id, dashboard and permission into the same array
      roleId = roleId.map((id) => [Number(id)]);
      for (let i = 0; i, i < roleId.length; i++) {
        roleId[i].unshift(dashboardId);
        roleId[i].push(permission[i]);
      }

      await conn.query(
        'INSERT INTO dashboard_permission(dashboard_id, role_id, permission) VALUES ?',
        [roleId]
      );
      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  deleteDashboard: async (dashboardId) => {
    const conn = await pool.getConnection();
    try {
      const sql = 'DELETE FROM dashboard WHERE id = ?';
      await conn.query(sql, [dashboardId]);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  getSources: async () => {
    const dbNames = await influx.getDatabaseNames();
    const newDB = dbNames.slice(1);
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
  },

  getTypeInstance: async (source) => {
    const database = source.split('/')[0];
    const measurement = `"${source.split('/')[1]}"`;
    const influxdb = new Influxdb.InfluxDB(
      `${INFLUX_URL}:${INFLUX_PORT}/${database}`
    );
    const tags = await influxdb.query(
      `SHOW tag values ON ${database} from ${measurement} with key = type_instance`
    );
    return tags.map((tag) => tag.value);
  },

  previewChart: async (req) => {
    const { timeRange, source, interval, type, interval_unit, select } =
      req.body;
    const database = source.split('/')[0];
    const measurement = `"${source.split('/')[1]}"`;
    const influxdb = new Influxdb.InfluxDB(
      `${INFLUX_URL}:${INFLUX_PORT}/${database}`
    );
    const intervalN = interval * units.timeUnits[interval_unit];
    const rangeIntoSec =
      timeRange.split('-')[0] * units.timeUnits[timeRange.split('-')[1]];
    const limit = Math.floor(rangeIntoSec / intervalN);

    let sql = `select ${select}(*) from ${measurement} GROUP BY time(${interval}${interval_unit}) order by DESC limit ${limit}`;
    if (type) {
      sql = `select ${select}(*) from ${measurement} WHERE type_instance = '${type}' GROUP BY time(${interval}${interval_unit}) order by DESC limit ${limit}`;
    }

    const system = await influxdb.query(sql);
    return system;
  },

  postChart: async (req) => {
    const { dashboardId, chartId } = req.params;
    const {
      timeRange,
      source,
      type,
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
      titlefont: { size: fontSize, color: '#FFF' },
      xaxis: {
        title: xAxisTitle,
        titlefont: { size: xAxisFontSize, color: '#FFF' },
        tickfont: { size: xAxisTickFontSize, color: '#FFF' },
      },
      yaxis: {
        title: yAxisTitle,
        titlefont: { size: yAxisFontSize, color: '#FFF' },
        tickfont: { size: yAxisTickFontSize, color: '#FFF' },
      },

      paper_bgcolor: 'rgb(52,58,64)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: { font: { color: '#FFF' } },
    };

    //Convert interval into millisecond
    let setInterval = interval * units.timeUnits[interval_unit] * 1000;
    setInterval = setInterval < 9999 ? 10000 : setInterval;

    const data = {
      title: title,
      dashboard_id: dashboardId,
      database: database,
      measurement: measurement,
      type: type,
      chart_type: style,
      time_range: timeRange,
      interval: interval,
      interval_unit: interval_unit,
      select: select,
      layout: JSON.stringify(layout),
      setInterval: setInterval,
    };

    const timeUnits = 'smhdw';
    if (
      isNaN(fontSize) ||
      fontSize < 1 ||
      isNaN(interval) ||
      interval < 1 ||
      !timeUnits.includes(interval_unit) ||
      xAxisTitle.length > 20 ||
      yAxisTitle.length > 20 ||
      isNaN(xAxisFontSize) ||
      xAxisFontSize < 1 ||
      isNaN(xAxisTickFontSize) ||
      xAxisTickFontSize < 1 ||
      isNaN(yAxisFontSize) ||
      yAxisFontSize < 1 ||
      isNaN(yAxisTickFontSize) ||
      yAxisTickFontSize < 1
    ) {
      return false;
    }

    const conn = await pool.getConnection();
    try {
      if (chartId) {
        await conn.query('UPDATE chart SET ? WHERE id = ?', [data, chartId]);
      } else {
        await conn.query('INSERT INTO chart SET ?', [data]);
      }
      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  deleteChart: async (chartId) => {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM chart WHERE id = ?', [chartId]);
      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  getChartDetail: async (dashboardId, chartId) => {
    const chartQuery = 'SELECT * FROM chart WHERE id = ?';
    const [[chart]] = await pool.query(chartQuery, chartId);

    if (!chart) {
      return false;
    }

    const layout = JSON.parse(chart.layout);
    const data = {
      dashboardId: dashboardId,
      chartId: chartId,
      title: layout.title,
      titleFontSize: layout.titlefont.size,
      timeRange: chart.time_range,
      source: chart.database + '/' + chart.measurement,
      type: chart.type,
      style: chart.chart_type,
      interval: chart.interval,
      interval_unit: chart.interval_unit,
      select: chart.select,
      xAxisTitle: layout.xaxis.title,
      xAxisFontSize: layout.xaxis.titlefont.size,
      xAxisTickFontSize: layout.xaxis.tickfont.size,
      yAxisTitle: layout.yaxis.title,
      yAxisFontSize: layout.yaxis.titlefont.size,
      yAxisTickFontSize: layout.yaxis.tickfont.size,
    };
    return data;
  },

  getCharts: async (dashboardId) => {
    const chartQuery =
      'SELECT * FROM dashboard INNER JOIN chart ON chart.dashboard_id = dashboard.id WHERE chart.dashboard_id = ?';
    const [chart] = await pool.query(chartQuery, dashboardId);
    return chart;
  },

  getPermission: async (dashboardId) => {
    const sql = `SELECT dashboard_permission.*, role.name as role_name FROM dashboard_permission 
      INNER JOIN role ON dashboard_permission.role_id = role.id 
      WHERE dashboard_permission.dashboard_id = ? `;
    const [permission] = await pool.query(sql, [dashboardId]);
    return permission;
  },
};

module.exports = dashboardModel;
