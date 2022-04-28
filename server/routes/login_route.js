const express = require('express');
const router = express.Router();
const passport = require('../../configs/passport');

const loginController = require('../controllers/login_controller');

router.get('/', async (req, res) => {
  return res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  loginController.login
);

module.exports = router;
