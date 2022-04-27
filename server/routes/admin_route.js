const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role_controller');
const userController = require('../controllers/user_controller');

router.get('/users', userController.getUsers);
router.get('/users/create', userController.getUserCreate);

router.post('/users', userController.postUser);
router.get('/users/:userId', userController.getUser);
router.put('/users/:userId', userController.postUser);
router.delete('/users/:userId', userController.deleteUser);

router.get('/roles', roleController.getRoles);
router.get('/roles/create', roleController.getRoleCreate);

router.post('/roles', roleController.postRole);
router.get('/roles/:roleId', roleController.getRole);
router.put('/roles/:roleId', roleController.postRole);
router.delete('/roles/:roleId', roleController.deleteRole);

module.exports = router;
