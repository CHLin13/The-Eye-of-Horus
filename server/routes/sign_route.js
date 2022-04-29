const express = require('express');
const router = express.Router();
const passport = require('../../configs/passport');

const loginController = require('../controllers/sign_controller');

router.get('/', loginController.indexPage);

router.get('/login', loginController.loginPage);

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  loginController.login
);

router.post('/logout', loginController.logout);

module.exports = router;
