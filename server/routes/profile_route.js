const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile_controller');
const { authenticated } = require('../../utils/auth');

router.get('/', authenticated, profileController.getProfile);
router.get('/:userId', authenticated, profileController.getProfileEdit);

router.post('/:userId', authenticated, profileController.postProfile);

module.exports = router;
