const express = require('express');
const router = express.Router();

const receiverController = require('../controllers/receiver_controller');

router.get('/', receiverController.getReceivers);

router.get('/create', receiverController.getReceiverCreate);

router.post('/', receiverController.postReceiver);
router.get('/:receiverId', receiverController.getReceiver);
router.put('/:receiverId', receiverController.postReceiver);
router.delete('/:receiverId', receiverController.deleteReceiver);

module.exports = router;
