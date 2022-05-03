const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role_controller');
const userController = require('../controllers/user_controller');

const { authenticatedSuper } = require('../../utils/auth');

//user
router.get('/users', authenticatedSuper, userController.getUsers);
router.get('/users/create', authenticatedSuper, userController.getUserCreate);

router.post('/users', authenticatedSuper, userController.postUser);
router.get('/users/:userId', authenticatedSuper, userController.getUser);
router.put('/users/:userId', authenticatedSuper, userController.postUser);
router.delete('/users/:userId', authenticatedSuper, userController.deleteUser);


//role
router.get('/roles', authenticatedSuper, roleController.getRoles);
router.get('/roles/create', authenticatedSuper, roleController.getRoleCreate);

router.post('/roles', authenticatedSuper, roleController.postRole);
router.get('/roles/:roleId', authenticatedSuper, roleController.getRole);
router.put('/roles/:roleId', authenticatedSuper, roleController.postRole);
router.delete('/roles/:roleId', authenticatedSuper, roleController.deleteRole);

module.exports = router;
