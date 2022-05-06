const { validationResult } = require('express-validator');

const loginController = {
  indexPage: async (req, res) => {
    try {
      if (req.user) {
        return res.status(301).redirect('/dashboards');
      }
      return res.status(301).redirect('/login');
    } catch (error) {
      console.error(`Get index page error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  signinPage: async (req, res) => {
    try {
      if (req.user) {
        return res.status(301).redirect('/dashboards');
      }
      return res.status(200).render('login');
    } catch (error) {
      console.error(`Get login page error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  signin: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (errors.errors[0].param === 'email') {
          req.flash('error_messages', 'Email format is incorrect');
        } else if (errors.errors[0].param === 'password') {
          req.flash('error_messages', 'Password should over than 8 characters');
        }
        return res.status(301).redirect(`/login`);
      }
      return res.status(301).redirect('/dashboards');
    } catch (error) {
      console.error(`Login url error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  signout: (req, res) => {
    try {
      req.flash('success_messages', 'Logout success');
      req.logout();
      return res.status(301).redirect('/login');
    } catch (error) {
      console.error(`Sign out error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = loginController;
