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
    const [dashboards] = await pool.query(sql);
    let dashboardsArr = dashboards.reduce((accu, curr) => {
      if (!accu[curr.id]) {
        accu[curr.id] = curr;
        accu[curr.id].role_id = [curr.role_id];
        accu[curr.id].permission = [curr.permission];
      } else {
        accu[curr.id].role_id.push(curr.role_id);
        accu[curr.id].permission.push(curr.permission);
      }
      return accu;
    }, []);
    dashboardsArr = dashboardsArr.filter((item) => {
      return item !== null;
    });
    return dashboardsArr;
  },

  getDashboard: async (dashboardId) => {
    let sql =
      'SELECT dashboard.* , dashboard_permission.role_id,dashboard_permission.permission FROM dashboard LEFT JOIN dashboard_permission ON dashboard.id = dashboard_permission.dashboard_id WHERE dashboard.id = ?';
    const [dashboard] = await pool.query(sql, [dashboardId]);
    if (dashboard.length > 0) {
      dashboard[0].role_id = dashboard.map((dashboard) => dashboard.role_id);
      dashboard[0].permission = dashboard.map(
        (dashboard) => dashboard.permission
      );
    }
    return dashboard;
  },

  postDashboard: async (name, roleId, permission, dashboardId) => {
    const conn = await pool.getConnection();
    try {
      if (dashboardId) {
        await conn.query(`UPDATE dashboard SET ? WHERE id = ?`, [
          { name: name },
          dashboardId,
        ]);
        await conn.query(
          `DELETE FROM dashboard_permission WHERE dashboard_id = ?`,
          [dashboardId]
        );
      } else {
        const [dashboard] = await conn.query(`INSERT INTO dashboard SET ?`, [
          { name: name },
        ]);
        dashboardId = dashboard.insertId;
      }

      roleId = roleId.map((id) => [Number(id)]);
      for (let i = 0; i, i < roleId.length; i++) {
        roleId[i].unshift(dashboardId);
        roleId[i].push(permission[i]);
      }

      await conn.query(
        `INSERT INTO dashboard_permission(dashboard_id, role_id, permission) VALUES ?`,
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

  getSource: async () => {
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
  },

  getTypeInstance: async (source) => {
    const database = source.split('/')[0];
    let measurement = source.split('/')[1];
    const influxdb = new Influxdb.InfluxDB(
      `${INFLUX_URL}:${INFLUX_PORT}/${database}`
    );
    if (database === 'App') {
      measurement = `"${measurement}"`;
    }
    const system = await influxdb.query(
      `SHOW tag values ON ${database} from ${measurement} with key = type_instance`
    );
    const typeInstance = [];
    system.forEach((item) => typeInstance.push(item.value));
    return typeInstance;
  },

  previewChart: async (req) => {
    const { timeRange, source, interval, type, interval_unit, select } =
      req.body;
    const database = source.split('/')[0];
    let measurement = source.split('/')[1];
    const influxdb = new Influxdb.InfluxDB(
      `${INFLUX_URL}:${INFLUX_PORT}/${database}`
    );

    const intervalN = interval * units.timeUnits[interval_unit];
    const rangeIntoSec =
      timeRange.split('-')[0] * units.timeUnits[timeRange.split('-')[1]];
    const limit = Math.floor(rangeIntoSec / intervalN);

    if (database === 'App') {
      measurement = `"${measurement}"`;
    }

    if (type) {
      const system = await influxdb.query(
        `select ${select}(*) from ${measurement} WHERE type_instance = '${type}' GROUP BY time(${interval}${interval_unit}) order by DESC limit ${limit}`
      );
      return system;
    }
    const system = await influxdb.query(
      `select ${select}(*) from ${measurement} GROUP BY time(${interval}${interval_unit}) order by DESC limit ${limit}`
    );
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

    const str = 'smhdw';
    if (
      isNaN(fontSize) ||
      fontSize < 1 ||
      isNaN(interval) ||
      interval < 1 ||
      !str.includes(interval_unit) ||
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
        await conn.query(`UPDATE chart SET ? WHERE id = ?`, [data, chartId]);
      } else {
        await conn.query(`INSERT INTO chart SET ?`, [data]);
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
      await conn.query(`DELETE FROM chart WHERE id = ?`, [chartId]);
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
    const [chart] = await pool.query(chartQuery, chartId);
    if (chart.length === 0) {
      return false;
    }
    const layout = JSON.parse(chart[0].layout);
    const data = {
      dashboardId: dashboardId,
      chartId: chartId,
      title: layout.title,
      titleFontSize: layout.titlefont.size,
      timeRange: chart[0].time_range,
      source: chart[0].database + '/' + chart[0].measurement,
      type: chart[0].type,
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
    return data;
  },

  getCharts: async (dashboardId) => {
    const chartQuery =
      'SELECT * FROM dashboard INNER JOIN chart ON chart.dashboard_id = dashboard.id WHERE chart.dashboard_id = ?';
    const [chart] = await pool.query(chartQuery, dashboardId);
    for (let i = 0; i < chart.length; i++) {
      chart[i].dashboardId = dashboardId;
    }
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
