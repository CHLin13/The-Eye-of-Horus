const appModel = require('../models/app_model');

const appController = {
  postData: async (req, res) => {
    try {
      await appModel.postData(req);
      return res.status(200).json({ message: 'Post data success' });
    } catch (error) {
      console.error(`Post data error: ${error}`);
      return res.status(500).json({ message: `Post data error: ${error}` });
    }
  },
};

module.exports = appController;
