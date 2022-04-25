const express = require('express');
const router = express.Router();

const appController = require('../controllers/app_controller');

router.post('/postData', appController.postData);

module.exports = router;
