const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role_controller');
const userController = require('../controllers/user_controller');

const { authenticatedAdmin } = require('../../utils/auth');

router.get('/users', authenticatedAdmin, userController.getUsers);
router.get('/users/create', authenticatedAdmin, userController.getUserCreate);

router.post('/users', authenticatedAdmin, userController.postUser);
router.get('/users/:userId', authenticatedAdmin, userController.getUser);
router.put('/users/:userId', authenticatedAdmin, userController.postUser);
router.delete('/users/:userId', authenticatedAdmin, userController.deleteUser);

router.get('/roles', authenticatedAdmin, roleController.getRoles);
router.get('/roles/create', authenticatedAdmin, roleController.getRoleCreate);

router.post('/roles', authenticatedAdmin, roleController.postRole);
router.get('/roles/:roleId', authenticatedAdmin, roleController.getRole);
router.put('/roles/:roleId', authenticatedAdmin, roleController.postRole);
router.delete('/roles/:roleId', authenticatedAdmin, roleController.deleteRole);

module.exports = router;
