const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  return res.render('login')
  // return res.redirect('/dashboards');
});

router.post('/login', async (req, res) => {
  // return res.render('login');
  // return res.redirect('/dashboards');
});


module.exports = router;
