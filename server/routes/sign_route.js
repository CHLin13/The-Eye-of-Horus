const express = require('express');
const router = express.Router();
const passport = require('../../configs/passport');

const loginController = require('../controllers/sign_controller');

router.get('/', loginController.indexPage);

router.get('/login', loginController.signinPage);

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  loginController.signin
);

router.post('/logout', loginController.signout);

module.exports = router;
