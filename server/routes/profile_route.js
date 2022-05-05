const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const profileController = require('../controllers/profile_controller');
const { authenticated } = require('../../utils/auth');

router.get('/', authenticated, profileController.getProfile);
router.get('/:userId', authenticated, profileController.getProfileEdit);

router.post(
  '/:userId',
  authenticated,
  [
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
  ],
  profileController.postProfile
);
module.exports = router;
