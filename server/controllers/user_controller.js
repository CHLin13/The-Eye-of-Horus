const { validationResult } = require('express-validator');
const userModel = require('../models/user_model');
const roleModel = require('../models/role_model');
const bcrypt = require('bcryptjs');
const util = require('util');

const hash = util.promisify(bcrypt.hash);

const userController = {
  getUsers: async (req, res) => {
    try {
      const user = await userModel.getUsers();
      return res.status(200).render('users', { user });
    } catch (error) {
      console.error(`Get role list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getUserCreate: async (req, res) => {
    try {
      const role = await roleModel.getRoles();
      return res.status(200).render('user_create', { role });
    } catch (error) {
      console.error(`Get role create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, superuser, status, role } = req.body;

      const passwordDefault = 'aaaaaaaa';
      const saltRounds = 10;
      const hashedPassword = await hash(passwordDefault, saltRounds);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (errors.errors[0].param === 'email') {
          req.flash('error_messages', 'Email format is incorrect');
        } else {
          req.flash('error_messages', 'All fields are required');
        }
        return res
          .status(401)
          .json({
            message: 'Email format is incorrect or all fields are required',
          });
      }

      await userModel.postUser(
        name,
        email,
        hashedPassword,
        superuser,
        status,
        role,
        userId
      );
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
      const role = await roleModel.getRoles();
      return res.status(200).render('user_create', { user, role });
    } catch (error) {
      console.error(`Get user error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      await userModel.deleteUser(userId);
      return res.status(301).redirect('/admin/users');
    } catch (error) {
      console.error(`Delete role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = userController;
