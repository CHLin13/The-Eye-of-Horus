const loginController = {
  indexPage: async (req, res) => {
    if (req.user) {
      return res.status(301).redirect('/dashboards');
    }
    return res.status(301).redirect('/login');
  },

  loginPage: async (req, res) => {
    if (req.user) {
      return res.status(301).redirect('/dashboards');
    }
    return res.status(200).render('login');
  },

  login: async (req, res) => {
    return res.status(301).redirect('/dashboards');
  },

  logout: (req, res) => {
    req.flash('success_messages', 'Logout success');
    req.logout();
    return res.status(301).redirect('/login');
  },
};

module.exports = loginController;
