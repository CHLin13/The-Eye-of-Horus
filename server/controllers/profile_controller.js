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
      return res.status(200).render('profile_edit');
    } catch (error) {
      console.error(`Get profile edit error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postProfile: async (req, res) => {
    try {
      const userId = JSON.parse(req.user).id;
      const { name, email, password, newPassword } = req.body;
      let tempPassword = password;
      if (newPassword) {
        tempPassword = newPassword;
      }

      const hashedPassword = await profileModel.getPassword(userId);

      const compareResult = await compare(password, hashedPassword.password);
      if (compareResult) {
        const saltRounds = 10;
        const hashedPassword = await hash(tempPassword, saltRounds);

        await profileModel.postProfile(name, email, hashedPassword, userId);
        req.flash('success_messages', 'Update success');
        return res.status(301).redirect('/profile');
      } else {
        req.flash('error_messages', 'Incorrect password');
        return res.status(301).redirect(`/profile/${userId}`);
      }
    } catch (error) {
      console.error(`Post profile error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = profileController;
