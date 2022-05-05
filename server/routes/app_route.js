const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const appController = require('../controllers/app_controller');

router.post(
  '/postData',
  [
    body('timestamp').not().isEmpty(),
    body('name').not().isEmpty(),
    body('value').not().isEmpty(),
  ],
  appController.postData
);

module.exports = router;
