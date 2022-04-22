const express = require('express');
const router = express.Router();

const receiverController = require('../controllers/receiver_controller');

router.get('/', receiverController.getReceiverList);

router.get('/create', receiverController.getReceiverCreate);

router.post('/create', receiverController.postReceiverCreate);

module.exports = router;
