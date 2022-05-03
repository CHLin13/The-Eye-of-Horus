const receiverModel = require('../models/receiver_model');

const receiverController = {
  getReceivers: async (req, res) => {
    try {
      const receiver = await receiverModel.getReceiver();
      return res.status(200).render('receivers', { receiver });
    } catch (error) {
      console.error(`Get receiver list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getReceiverCreate: async (req, res) => {
    try {
      return res.status(200).render('receiver_create');
    } catch (error) {
      console.error(`Get receiver create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postReceiver: async (req, res) => {
    try {
      const url = await receiverModel.postReceiver(req);
      return res.status(301).redirect(url);
    } catch (error) {
      console.error(`Post receiver error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getReceiver: async (req, res) => {
    try {
      const { receiverId } = req.params;
      const [receiver] = await receiverModel.getReceiver(receiverId);
      if (!receiver) {
        return res.status(301).redirect('/receivers');
      }
      return res.status(200).render('receiver_create', { receiver });
    } catch (error) {
      console.error(`Get receiver error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteReceiver: async (req, res) => {
    const { receiverId } = req.params;
    try {
      await receiverModel.deleteReceiver(receiverId);
      return res.status(301).redirect('/receivers');
    } catch (error) {
      console.error(`Delete receiver error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = receiverController;
