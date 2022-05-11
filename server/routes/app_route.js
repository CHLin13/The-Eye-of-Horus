const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const appController = require('../controllers/app_controller');

router.post(
  '/postData',
  [
    body('timestamp').notEmpty(),
    body('name').notEmpty(),
    body('value').notEmpty(),
  ],
  appController.postData
);

module.exports = router;
