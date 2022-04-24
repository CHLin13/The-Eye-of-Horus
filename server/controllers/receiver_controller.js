require('dotenv').config();
const receiverModel = require('../models/receiver_model');

const receiverController = {
  getReceivers: async (req, res) => {
    try {
      const receiver = await receiverModel.getReceiver();
      return res.render('receivers', { receiver });
    } catch (error) {
      console.error(`Get receiver list error: ${error}`);
    }
  },

  getReceiverCreate: async (req, res) => {
    try {
      return res.render('receiver_create');
    } catch (error) {
      console.error(`Get receiver create error: ${error}`);
    }
  },

  postReceiverCreate: async (req,res) => {
    await receiverModel.postReceiver(req)
    return res.redirect('/receivers');
  }
};

module.exports = receiverController;
