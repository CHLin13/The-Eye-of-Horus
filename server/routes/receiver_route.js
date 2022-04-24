const express = require('express');
const router = express.Router();

const receiverController = require('../controllers/receiver_controller');

router.get('/', receiverController.getReceivers);

router.get('/create', receiverController.getReceiverCreate);

router.post('/create', receiverController.postReceiverCreate);
router.delete('/:receiverId', receiverController.deleteReceiver);

module.exports = router;
