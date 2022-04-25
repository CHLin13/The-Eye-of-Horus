require('dotenv').config();
const appModel = require('../models/app_model');

const appController = {
  postData: async (req, res) => {
    try {
      await appModel.postData(req);
      return res.json({ message: 'Post data success' });
    } catch (error) {
      console.error(`Post data error: ${error}`);
      return res.json({ message: `Post data error: ${error}` });
    }
  },
};

module.exports = appController;
