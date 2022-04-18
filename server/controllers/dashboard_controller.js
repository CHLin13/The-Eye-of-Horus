require('dotenv').config();
const {
  getSource,
  postChart,
  getChartDetail,
  getCharts,
  previewChart,
} = require('../models/dashboard_model');

const dashboardController = {
  getDashboardList: async (req, res) => {
    return res.render('dashboards');
  },

  chartPreview: async (req, res) => {
    try {
      const data = await previewChart(req);
      return res.status(200).json({ data: data, select: req.body.select });
    } catch (error) {
      console.error(`Preview chart error: ${error}`);
    }
  },

  getDashboardCreate: async (req, res) => {
    try {
      const dashboardId = req.params.dashboardId;
      const source = await getSource();
      return res.render('create', { source, dashboardId });
    } catch (error) {
      console.error(`Get dashboard create error: ${error}`);
    }
  },

  postDashboardCreate: async (req, res) => {
    try {
      postChart(req);
      return res.redirect(`/dashboards/${req.params.dashboardId}`);
    } catch (error) {
      console.error(`Post dashboard create error: ${error}`);
    }
  },

  getDashboardDetail: async (req, res) => {
    try {
      const dashboardId = req.params.dashboardId;
      const chart = await getCharts(dashboardId);
      return res.render('dashboard_detail', { chart });
    } catch (error) {
      console.error(`Get dashboard detail error: ${error}`);
    }
  },

  getChartDetail: async (req, res) => {
    try {
      const { dashboardId, chartId } = req.params;
      const data = await getChartDetail(dashboardId, chartId);
      const source = await getSource();
      return res.render('create', { data, source });
    } catch (error) {
      console.error(`Get chart detail error: ${error}`);
    }
  },

  putChart: async (req, res) => {
    try {
      postChart(req);
      return res.redirect(`/dashboards/${req.params.dashboardId}`);
    } catch (error) {
      console.error(`Put chart error: ${error}`);
    }
  },
};

module.exports = dashboardController;
