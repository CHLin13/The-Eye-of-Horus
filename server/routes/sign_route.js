const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const passport = require('../../configs/passport');

const loginController = require('../controllers/sign_controller');

router.get('/', loginController.indexPage);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
  ],
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  loginController.signin
);

//sign out
router.post('/logout', loginController.signout);

module.exports = router;
