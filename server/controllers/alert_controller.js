require('dotenv').config();
const dashboardModel = require('../models/dashboard_model');
const alertModel = require('../models/alert_model');

const alertController = {
  getAlertList: async (req, res) => {
    const alert = await alertModel.getAlerts();
    return res.render('alerts', { alert });
  },

  getAlertCreate: async (req, res) => {
    const source = await dashboardModel.getSource();
    const receiver = await alertModel.getReceiver();
    return res.render('alert_create', { source, receiver });
  },

  postAlertCreate: async (req, res) => {
    try {
      await alertModel.postAlert(req);
      return res.redirect(`/alerts`);
    } catch (error) {
      console.error(`Post alert create error: ${error}`);
    }
  },

  getAlert: async (req, res) => {
    const alertId = req.params.alertId;
    const source = await dashboardModel.getSource();
    const receiver = await alertModel.getReceiver();
    const data = await alertModel.getAlert(alertId);
    const type = await dashboardModel.getTypeInstance(data.source);
    return res.render('alert_create', { data, source, receiver, type });
  },

  putAlert: async (req, res) => {
    try {
      await alertModel.postAlert(req);
      return res.redirect(`/alerts`);
    } catch (error) {
      console.error(`Put alert create error: ${error}`);
    }
  },
};

module.exports = alertController;
