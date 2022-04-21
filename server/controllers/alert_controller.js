require('dotenv').config();
const dashboardModel = require('../models/dashboard_model');
const alertModel = require('../models/alert_model');

const alertController = {
  getAlertList: async (req, res) => {
    return res.render('alerts');
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
};

module.exports = alertController;
