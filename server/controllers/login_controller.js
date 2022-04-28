const userController = {
  login: async (req, res) => {
    req.flash('success_messages', 'Login success');
    res.redirect('/dashboards');
  },
};

module.exports = userController;
