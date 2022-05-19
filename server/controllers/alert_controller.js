const { validationResult } = require('express-validator');
const dashboardModel = require('../models/dashboard_model');
const alertModel = require('../models/alert_model');

const alertController = {
  getAlerts: async (req, res) => {
    try {
      const alerts = await alertModel.getAlerts();
      return res.status(200).render('alerts', { alerts });
    } catch (error) {
      console.error(`Get alert list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postAlert: async (req, res) => {
    try {
      const { alertId } = req.params;
      const response = await alertModel.postAlert(req);
      const errors = validationResult(req);

      if (!errors.isEmpty() || !response) {
        req.flash('error_messages', 'Please follow the created rule');
        if (alertId) {
          return res.status(301).redirect(`/alerts/${alertId}`);
        }
        return res.status(301).redirect('/alerts/create');
      }

      return res.status(301).redirect('/alerts');
    } catch (error) {
      console.error(`Post alert create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      const sources = await dashboardModel.getSources();
      const receivers = await alertModel.getReceivers();

      if (!alertId) {
        return res.status(200).render('alert_create', { sources, receivers });
      }

      const data = await alertModel.getAlert(alertId);
      if (!data) {
        return res.status(301).redirect('/alerts');
      }

      const type = await dashboardModel.getTypeInstance(data.source);
      return res
        .status(200)
        .render('alert_create', { data, sources, receivers, type });
    } catch (error) {
      console.error(`Get alert error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      await alertModel.deleteAlert(alertId);
      return res.status(301).redirect('/alerts');
    } catch (error) {
      console.error(`Delete alert error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = alertController;
