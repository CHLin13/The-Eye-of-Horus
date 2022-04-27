const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role_controller');

router.get('/users', async (req, res) => {
  return res.render('users');
});

router.get('/users/edit/:id', async (req, res) => {
  return res.render('user_edit');
});

router.get('/roles', roleController.getRoles);
router.get('/roles/create', roleController.getRoleCreate);

router.post('/roles', roleController.postRole);
router.get('/roles/edit/:roleId', roleController.getRole);
router.put('/roles/:roleId', roleController.postRole);
router.delete('/roles/:roleId', roleController.deleteRole);

module.exports = router;
