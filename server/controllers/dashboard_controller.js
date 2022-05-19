const { validationResult } = require('express-validator');
const dashboardModel = require('../models/dashboard_model');
const roleModel = require('../models/role_model');
const { attachPermission } = require('../../utils/permission');

const dashboardController = {
  getDashboards: async (req, res) => {
    try {
      const userRole = res.locals.localUser.role_id;
      let dashboards = await dashboardModel.getDashboards();

      //Attach permission property to dashboards according to user's role
      dashboards = await attachPermission(dashboards, userRole);

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
      const { dashboardId } = req.params;
      const [dashboard] = await dashboardModel.getDashboard(dashboardId);
      const sources = await dashboardModel.getSources();

      if (!dashboard) {
        return res.status(301).redirect(`/dashboards`);
      }

      return res
        .status(200)
        .render('create', { sources, dashboardId, dashboard });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  chartPreview: async (req, res) => {
    try {
      const data = await dashboardModel.previewChart(req);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(401).json({ error: 'All fields are required' });
      }

      return res.status(200).json({ data: data, select: req.body.select });
    } catch (error) {
      console.error(`Preview chart error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getTypeInstance: async (req, res) => {
    try {
      const { source } = req.body;
      const typeInstance = await dashboardModel.getTypeInstance(source);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(401).json({ error: 'Source is required' });
      }

      return res.status(200).json(typeInstance);
    } catch (error) {
      console.error(`Get typeInstance error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postChart: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const response = await dashboardModel.postChart(req);
      const errors = validationResult(req);

      if (!errors.isEmpty() || !response) {
        req.flash(
          'error_messages',
          'Something wrong to create/edit the chart, please follow the created rule.'
        );
        if (chartId) {
          return res
            .status(301)
            .redirect(`/dashboards/${dashboardId}/chart/${chartId}`);
        }
        return res.status(301).redirect(`/dashboards/${dashboardId}/create`);
      }

      return res.status(301).redirect(`/dashboards/${dashboardId}`);
    } catch (error) {
      console.error(`Post dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getDashboard: async (req, res) => {
    try {
      const { dashboardId } = req.params;
      const userRole = res.locals.localUser.role_id;
      let dashboard = await dashboardModel.getDashboard(dashboardId);
      const charts = await dashboardModel.getCharts(dashboardId);

      if (!dashboard) {
        return res.status(301).redirect('/dashboards');
      }

      //Attach permission property to dashboard according to user role
      [dashboard] = await attachPermission(dashboard, userRole);

      return res.status(200).render('dashboard_detail', {
        charts,
        dashboard,
      });
    } catch (error) {
      console.error(`Get dashboard detail error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getChart: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const [dashboard] = await dashboardModel.getDashboard(dashboardId);
      const chart = await dashboardModel.getChartDetail(dashboardId, chartId);
      const sources = await dashboardModel.getSources();

      if (!dashboard) {
        return res.status(301).redirect(`/dashboards`);
      } else if (!chart) {
        return res.status(301).redirect(`/dashboards/${dashboardId}`);
      }

      const typeInstance = await dashboardModel.getTypeInstance(chart.source);
      return res
        .status(200)
        .render('create', { chart, sources, typeInstance, dashboard });
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
      const roles = await roleModel.getRoles();
      let dashboard = await dashboardModel.getDashboard(dashboardId);
      const permission = await dashboardModel.getPermission(dashboardId);

      if (!dashboard) {
        return res.status(301).redirect('/dashboards');
      }

      dashboard = dashboard[0];
      return res.status(200).render('dashboard_setting', {
        roles,
        dashboard,
        dashboardId,
        permission,
      });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getDashboardCreate: async (req, res) => {
    try {
      const roles = await roleModel.getRoles();
      return res.status(200).render('dashboard_setting', { roles });
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
        req.flash(
          'error_messages',
          'All fields are required; Max length of name is 60 characters'
        );
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
