const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  return res.render('dashboards');
});

router.get('/1/create', async (req, res) => {
  return res.render('create');
});

router.get('/:id', async (req, res) => {
  return res.render('dashboard_detail');
});

router.get('/setting/:id', async (req, res) => {
  return res.render('dashboard_setting');
});

module.exports = router;