require('dotenv').config();
const dashboardModel = require('../models/dashboard_model');
const alertModel = require('../models/alert_model');

const alertController = {
  getAlertList: async (req, res) => {
    try {
      const alert = await alertModel.getAlerts();
      return res.render('alerts', { alert });
    } catch (error) {
      console.error(`Get alert list error: ${error}`);
    }
  },

  getAlertCreate: async (req, res) => {
    try {
      const source = await dashboardModel.getSource();
      const receiver = await alertModel.getReceiver();
      return res.render('alert_create', { source, receiver });
    } catch (error) {
      console.error(`Get alert create error: ${error}`);
    }
  },

  postAlert: async (req, res) => {
    try {
      await alertModel.postAlert(req);
      return res.redirect(`/alerts`);
    } catch (error) {
      console.error(`Post alert create error: ${error}`);
    }
  },

  getAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      const source = await dashboardModel.getSource();
      const receiver = await alertModel.getReceiver();
      const data = await alertModel.getAlert(alertId);
      const type = await dashboardModel.getTypeInstance(data.source);
      return res.render('alert_create', { data, source, receiver, type });
    } catch (error) {
      console.error(`Get alert error: ${error}`);
    }
  },

  deleteAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      await alertModel.deleteAlert(alertId);
      return res.redirect(`/alerts`);
    } catch (error) {
      console.error(`Delete alert error: ${error}`);
    }
  },
};

module.exports = alertController;
