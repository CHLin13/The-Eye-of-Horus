const loginController = {
  indexPage: async (req, res) => {
    if (req.user) {
      return res.redirect('/dashboards');
    }
    return res.redirect('/login');
  },

  loginPage: async (req, res) => {
    if (req.user) {
      return res.redirect('/dashboards');
    }
    return res.render('login');
  },

  login: async (req, res) => {
    req.flash('success_messages', 'Login success');
    return res.redirect('/dashboards');
  },

  logout: (req, res) => {
    req.flash('success_messages', 'Logout success');
    req.logout();
    return res.redirect('/');
  },
};

module.exports = loginController;
