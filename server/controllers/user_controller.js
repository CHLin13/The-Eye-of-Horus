const userModel = require('../models/user_model');
const bcrypt = require('bcryptjs');
const util = require('util');

const hash = util.promisify(bcrypt.hash);

const userController = {
  getUsers: async (req, res) => {
    try {
      const user = await userModel.getUsers();
      return res.render('users', { user });
    } catch (error) {
      console.error(`Get role list error: ${error}`);
    }
  },

  getUserCreate: async (req, res) => {
    try {
      return res.render('user_create');
    } catch (error) {
      console.error(`Get role create error: ${error}`);
    }
  },

  postUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, status, admin } = req.body;
      const passwordDefault = 'aaaa';
      const saltRounds = 10;
      const hashedPassword = await hash(passwordDefault, saltRounds);

      await userModel.postUser(
        name,
        email,
        hashedPassword,
        admin,
        status,
        userId
      );
      return res.redirect('/admin/users');
    } catch (error) {
      console.error(`Post role error: ${error}`);
    }
  },

  getUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userModel.getUser(userId);
      return res.render('user_create', { user });
    } catch (error) {
      console.error(`Get role error: ${error}`);
    }
  },

  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      await userModel.deleteUser(userId);
      return res.redirect('/admin/users');
    } catch (error) {
      console.error(`Delete role error: ${error}`);
    }
  },
};

module.exports = userController;
