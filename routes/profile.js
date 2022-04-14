const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  return res.render('profile');
});

router.get('/:id', async (req, res) => {
  return res.render('profile_edit');
});

module.exports = router;