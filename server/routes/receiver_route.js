const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const receiverController = require('../controllers/receiver_controller');

const { authenticated } = require('../../utils/auth');

router.get('/', authenticated, receiverController.getReceivers);
router.get('/create', authenticated, receiverController.getReceiverCreate);

router.post(
  '/',
  authenticated,
  [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('type').notEmpty(),
  ],
  receiverController.postReceiver
);

router.get('/:receiverId', authenticated, receiverController.getReceiver);
router.put(
  '/:receiverId',
  authenticated,
  [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('type').notEmpty(),
  ],
  receiverController.postReceiver
);
router.delete('/:receiverId', authenticated, receiverController.deleteReceiver);

module.exports = router;
