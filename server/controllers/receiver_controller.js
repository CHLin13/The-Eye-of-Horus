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

  postReceiver: async (req, res) => {
    try {
      await receiverModel.postReceiver(req);
      return res.redirect('/receivers');
    } catch (error) {
      console.error(`Post receiver error: ${error}`);
    }
  },

  getReceiver: async (req, res) => {
    try {
      const { receiverId } = req.params;
      const [receiver] = await receiverModel.getReceiver(receiverId);
      return res.render('receiver_create', { receiver });
    } catch (error) {
      console.error(`Get receiver error: ${error}`);
    }
  },

  deleteReceiver: async (req, res) => {
    const { receiverId } = req.params;
    try {
      await receiverModel.deleteReceiver(receiverId);
      return res.redirect('/receivers');
    } catch (error) {
      console.error(`Delete receiver error: ${error}`);
    }
  },
};

module.exports = receiverController;
