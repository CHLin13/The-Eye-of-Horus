const { validationResult } = require('express-validator');
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
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteDashboard: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      await dashboardModel.deleteDashboard(dashboardId);
      return res.status(301).redirect('/dashboards');
    } catch (error) {
      console.error(`Delete dashboard error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getChartCreate: async (req, res) => {
    try {
      const dashboardId = req.params.dashboardId;
      const dashboard = await dashboardModel.getDashboard(dashboardId);
      if (dashboard.length === 0) {
        return res.status(301).redirect(`/dashboards`);
      }
      const source = await dashboardModel.getSource();
      return res.status(200).render('create', { source, dashboardId });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  chartPreview: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).json({ error: 'All fields are required' });
      }
      const data = await dashboardModel.previewChart(req);
      return res.status(200).json({ data: data, select: req.body.select });
    } catch (error) {
      console.error(`Preview chart error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getTypeInstance: async (req, res) => {
    try {
      const { source } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).json({ error: 'Source is required' });
      }
      const result = await dashboardModel.getTypeInstance(source);
      return res.status(200).json(result);
    } catch (error) {
      console.error(`Get typeInstance error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postChart: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error_messages', 'All fields are required');
        if (chartId) {
          return res
            .status(301)
            .redirect(`/dashboards/${dashboardId}/chart/${chartId}`);
        }
        return res.status(301).redirect(`/dashboards/${dashboardId}/create`);
      }
      await dashboardModel.postChart(req);
      return res.status(301).redirect(`/dashboards/${dashboardId}`);
    } catch (error) {
      console.error(`Post dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
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

      if (!dashboard) {
        return res.status(301).redirect('/dashboards');
      }

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
      return res.status(500).send('Internal Server Error');
    }
  },

  getChart: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const dashboard = await dashboardModel.getDashboard(dashboardId);
      if (dashboard.length === 0) {
        return res.status(301).redirect(`/dashboards`);
      }
      const data = await dashboardModel.getChartDetail(dashboardId, chartId);
      if (!data) {
        return res.status(301).redirect(`/dashboards/${dashboardId}`);
      }
      const source = await dashboardModel.getSource();
      const type = await dashboardModel.getTypeInstance(data.source);

      return res.status(200).render('create', { data, source, type });
    } catch (error) {
      console.error(`Get chart detail error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteChart: async (req, res) => {
    try {
      const { chartId, dashboardId } = req.params;
      await dashboardModel.deleteChart(chartId);
      return res.status(301).redirect(`/dashboards/${dashboardId}`);
    } catch (error) {
      console.error(`Delete chart error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getDashboardSetting: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      const role = await roleModel.getRoles();
      const [dashboard] = await dashboardModel.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(301).redirect('/dashboards');
      }
      const permission = await dashboardModel.getPermission(dashboardId);
      return res.status(200).render('dashboard_setting', {
        role,
        dashboard,
        dashboardId,
        permission,
      });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getDashboardCreate:async (req, res) => {
    try {
      const role = await roleModel.getRoles();
      return res.status(200).render('dashboard_setting', { role });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postDashboard: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      const { name, roleId, permission } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error_messages', 'All fields are required');
        if (dashboardId) {
          return res.status(301).redirect(`/dashboards/${dashboardId}`);
        }
        return res.status(301).redirect(`/dashboards/create`);
      }

      await dashboardModel.postDashboard(name, roleId, permission, dashboardId);
      return res.status(301).redirect('/dashboards');
    } catch (error) {
      console.error(`Post dashboard error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = dashboardController;
