const dashboardModel = require('../models/dashboard_model');
const roleModel = require('../models/role_model');

const dashboardController = {
  getDashboards: async (req, res) => {
    try {
      const dashboards = await dashboardModel.getDashboards();

      for (let i = 0; i < dashboards.length; i++) {
        const obj = {};

        for (let j = 0; j < dashboards[i].role_id.length; j++) {
          obj[dashboards[i].role_id[j]] = dashboards[i].permission[j];
        }

        const userRole = res.locals.localUser.role_id;
        if (userRole) {
          for (let k = 0; k < userRole.length; k++) {
            if (obj[userRole[k]] === '3') {
              dashboards[i].adminPermission = true;
              dashboards[i].viewPermission = true;
            } else if (obj[userRole[k]] === '1' || obj[userRole[k]] === '2') {
              dashboards[i].viewPermission = true;
            }
          }
        }
      }
      return res.status(200).render('dashboards', { dashboards });
    } catch (error) {
      console.error(`Get dashboards error: ${error}`);
    }
  },

  deleteDashboard: async (req, res) => {
    const { dashboardId } = req.params;
    await dashboardModel.deleteDashboard(dashboardId);
    return res.status(301).redirect('/dashboards');
  },

  getChartCreate: async (req, res) => {
    try {
      const dashboardId = req.params.dashboardId;
      const source = await dashboardModel.getSource();
      return res.status(200).render('create', { source, dashboardId });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
    }
  },

  chartPreview: async (req, res) => {
    try {
      const data = await dashboardModel.previewChart(req);
      return res.status(200).json({ data: data, select: req.body.select });
    } catch (error) {
      console.error(`Preview chart error: ${error}`);
    }
  },

  getTypeInstance: async (req, res) => {
    const { source } = req.body;
    const result = await dashboardModel.getTypeInstance(source);
    return res.status(200).json(result);
  },

  postChart: async (req, res) => {
    try {
      await dashboardModel.postChart(req);
      return res.status(301).redirect(`/dashboards/${req.params.dashboardId}`);
    } catch (error) {
      console.error(`Post dashboard create error: ${error}`);
    }
  },

  getDashboard: async (req, res) => {
    try {
      const dashboardId = req.params.dashboardId;
      const [dashboard] = await dashboardModel.getDashboard(dashboardId);
      const chart = await dashboardModel.getCharts(dashboardId);
      let editPermission = false;
      let adminPermission = false;
      const userRole = res.locals.localUser.role_id;
      const obj = {};

      if (userRole) {
        for (let i = 0; i < dashboard.role_id.length; i++) {
          obj[dashboard.role_id[i]] = dashboard.permission[i];
        }

        for (let i = 0; i < userRole.length; i++) {
          if (obj[userRole[i]] === '3') {
            editPermission = true;
            adminPermission = true;
          } else if (obj[userRole[i]] === '2') {
            editPermission = true;
          }
        }
      }
      
      return res.status(200).render('dashboard_detail', {
        chart,
        dashboard,
        editPermission,
        adminPermission,
      });
    } catch (error) {
      console.error(`Get dashboard detail error: ${error}`);
    }
  },

  getChart: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const data = await dashboardModel.getChartDetail(dashboardId, chartId);
      const source = await dashboardModel.getSource();
      const type = await dashboardModel.getTypeInstance(data.source);

      return res.status(200).render('create', { data, source, type });
    } catch (error) {
      console.error(`Get chart detail error: ${error}`);
    }
  },

  deleteChart: async (req, res) => {
    try {
      const { chartId, dashboardId } = req.params;
      await dashboardModel.deleteChart(chartId);
      return res.status(301).redirect(`/dashboards/${dashboardId}`);
    } catch (error) {
      console.error(`Delete chart error: ${error}`);
    }
  },

  getDashboardSetting: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      const role = await roleModel.getRoles();
      const [dashboard] = await dashboardModel.getDashboard(dashboardId);
      const permission = await dashboardModel.getPermission(dashboardId);
      return res.status(200).render('dashboard_setting', {
        role,
        dashboard,
        dashboardId,
        permission,
      });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
    }
  },

  postDashboard: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      const { name, roleId, permission } = req.body;
      await dashboardModel.postDashboard(name, roleId, permission, dashboardId);
      return res.status(301).redirect('/dashboards');
    } catch (error) {
      console.error(`Post dashboard error: ${error}`);
    }
  },
};

module.exports = dashboardController;
