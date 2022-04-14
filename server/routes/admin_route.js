const express = require('express');
const router = express.Router();

router.get('/users', async (req, res) => {
  return res.render('users');
});

router.get('/users/edit/:id', async (req, res) => {
  return res.render('user_edit');
});

router.get('/roles', async (req, res) => {
  return res.render('roles')
});

router.get('/roles/edit/:id', async (req, res) => {
  return res.render('role_edit');
});

module.exports = router;
