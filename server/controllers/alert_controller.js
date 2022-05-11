const { validationResult } = require('express-validator');
const dashboardModel = require('../models/dashboard_model');
const alertModel = require('../models/alert_model');

const alertController = {
  getAlertList: async (req, res) => {
    try {
      const alert = await alertModel.getAlerts();
      return res.status(200).render('alerts', { alert });
    } catch (error) {
      console.error(`Get alert list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getAlertCreate: async (req, res) => {
    try {
      const source = await dashboardModel.getSource();
      const receiver = await alertModel.getReceiver();
      return res.status(200).render('alert_create', { source, receiver });
    } catch (error) {
      console.error(`Get alert create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postAlert: async (req, res) => {
    try {
      const { alertId } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error_messages', 'All fields are required');
        if (alertId) {
          return res.status(301).redirect(`/alerts/${alertId}`);
        }
        return res.status(301).redirect(`/alerts/create`);
      }
      await alertModel.postAlert(req);
      return res.status(301).redirect(`/alerts`);
    } catch (error) {
      console.error(`Post alert create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      const source = await dashboardModel.getSource();
      const receiver = await alertModel.getReceiver();
      const data = await alertModel.getAlert(alertId);
      if(!data){
        return res.status(301).redirect('/alerts');
      }
      const type = await dashboardModel.getTypeInstance(data.source);
      return res
        .status(200)
        .render('alert_create', { data, source, receiver, type });
    } catch (error) {
      console.error(`Get alert error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteAlert: async (req, res) => {
    try {
      const alertId = req.params.alertId;
      await alertModel.deleteAlert(alertId);
      return res.status(301).redirect(`/alerts`);
    } catch (error) {
      console.error(`Delete alert error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = alertController;
