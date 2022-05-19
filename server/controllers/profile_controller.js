const { validationResult } = require('express-validator');
const profileModel = require('../models/profile_model');
const bcrypt = require('bcryptjs');
const util = require('util');

const hash = util.promisify(bcrypt.hash);
const compare = util.promisify(bcrypt.compare);

const profileController = {
  getProfile: async (req, res) => {
    try {
      return res.status(200).render('profile');
    } catch (error) {
      console.error(`Get profile error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getProfileEdit: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = res.locals.localUser;

      if (Number(userId) !== user.id) {
        return res.status(301).redirect('/profile');
      }

      return res.status(200).render('profile_edit');
    } catch (error) {
      console.error(`Get profile edit error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postProfile: async (req, res) => {
    try {
      const userId = res.locals.localUser.id;
      const { name, email, password, newPassword, passwordConfirm } = req.body;
      let tempPassword = password;
      const userPassword = await profileModel.getPassword(userId);
      const compareResult = await compare(password, userPassword);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        if (errors.errors.some((item) => item.param === 'email')) {
          req.flash('error_messages', 'Email format is incorrect');
        } else if (errors.errors.some((item) => item.param === 'password')) {
          req.flash(
            'error_messages',
            'Password should over than 8 and less than 20 characters'
          );
        } else {
          req.flash('error_messages', 'Name is required');
        }
        return res.status(301).redirect(`/profile/${userId}`);
      }

      if (!compareResult) {
        req.flash('error_messages', 'Incorrect password');
        return res.status(301).redirect(`/profile/${userId}`);
      }

      if (newPassword) {
        if (newPassword.length < 8) {
          req.flash(
            'error_messages',
            'Password length should over than 8 characters'
          );
          return res.status(301).redirect(`/profile/${userId}`);
        } else if (newPassword !== passwordConfirm) {
          req.flash(
            'error_messages',
            'New Password is not match Password Confirm'
          );
          return res.status(301).redirect(`/profile/${userId}`);
        }
        tempPassword = newPassword;
      }

      const saltRounds = 10;
      const hashedPassword = await hash(tempPassword, saltRounds);
      const response = await profileModel.postProfile(
        name,
        email,
        hashedPassword,
        userId
      );

      if (!response) {
        req.flash('error_messages', 'Email already registered');
        return res.status(301).redirect(`/profile/${userId}`);
      }
      
      req.flash('success_messages', 'Update success');
      return res.status(301).redirect('/profile');
    } catch (error) {
      console.error(`Post profile error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = profileController;
