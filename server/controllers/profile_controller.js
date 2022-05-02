const profileModel = require('../models/profile_model');
const bcrypt = require('bcryptjs');
const util = require('util');

const hash = util.promisify(bcrypt.hash);
const compare = util.promisify(bcrypt.compare);

const profileController = {
  getProfile: async (req, res) => {
    return res.status(200).render('profile');
  },

  getProfileEdit: async (req, res) => {
    return res.status(200).render('profile_edit');
  },

  postProfile: async (req, res) => {
    try {
      const { userId } = req.params;
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
    }
  },
};

module.exports = profileController;
