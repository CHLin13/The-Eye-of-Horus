require('dotenv').config();
const receiverModel = require('../models/receiver_model');

const receiverController = {
  getReceiverList: async (req, res) => {
    return res.render('receivers');
  },

  getReceiverCreate: async (req, res) => {
    return res.render('receiver_create');
  },

  postReceiverCreate: async (req,res) => {
    await receiverModel.postReceiver(req)
    return res.redirect('/receivers');
  }
};

module.exports = receiverController;