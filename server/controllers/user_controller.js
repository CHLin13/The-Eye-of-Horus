require('dotenv').config();
const { superPermission, userStatus } = require('../../utils/enums');
const { validationResult } = require('express-validator');
const userModel = require('../models/user_model');
const roleModel = require('../models/role_model');
const bcrypt = require('bcryptjs');
const util = require('util');
const { DEFAULT_PASSWORD, BCRYPT_SALT } = process.env;

const hash = util.promisify(bcrypt.hash);

const userController = {
  getUsers: async (req, res) => {
    try {
      const users = await userModel.getUsers();
      return res.status(200).render('users', { users });
    } catch (error) {
      console.error(`Get role list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getUserCreate: async (req, res) => {
    try {
      const roles = await roleModel.getRoles();
      return res.status(200).render('user_create', { roles });
    } catch (error) {
      console.error(`Get role create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, superuser, status, role } = req.body;

      const passwordDefault = DEFAULT_PASSWORD;
      const saltRounds = BCRYPT_SALT;
      const hashedPassword = await hash(passwordDefault, saltRounds);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (errors.errors.some((item) => item.param === 'email')) {
          return res.status(401).json({
            message: 'Email format is incorrect',
          });
        } else {
          return res.status(401).json({
            message: 'Please follow the created rule',
          });
        }
      }

      if (!Object.values(superPermission).includes(superuser)) {
        return res.status(401).json({
          message: 'Superuser value is incorrect',
        });
      }
      if (!Object.values(userStatus).includes(status)) {
        return res.status(401).json({
          message: 'Status is incorrect',
        });
      }

      const response = await userModel.postUser(
        name,
        email,
        hashedPassword,
        superuser,
        status,
        role,
        userId
      );
      if (!response) {
        return res.status(401).json({
          message: 'Email already registered',
        });
      }

      return res.status(301).redirect('/admin/users');
    } catch (error) {
      console.error(`Post role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userModel.getUser(userId);

      if (!user) {
        return res.status(301).redirect('/admin/users');
      }

      const roles = await roleModel.getRoles();
      return res.status(200).render('user_create', { user, roles });
    } catch (error) {
      console.error(`Get user error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteUser: async (req, res) => {
    const { userId } = req.params;
    const user = res.locals.localUser;
    try {
      if (Number(userId) === user.id) {
        req.flash('error_messages', 'Can not delete yourself');
        return res.status(301).redirect('/admin/users');
      }

      await userModel.deleteUser(userId);
      return res.status(301).redirect('/admin/users');
    } catch (error) {
      console.error(`Delete role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = userController;
