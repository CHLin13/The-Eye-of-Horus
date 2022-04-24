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
    return res.render('receiver_create');
  },

  postReceiverCreate: async (req,res) => {
    await receiverModel.postReceiver(req)
    return res.redirect('/receivers');
  }
};

module.exports = receiverController;