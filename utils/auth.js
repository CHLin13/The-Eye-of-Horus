const auth = {
  authenticated: (req, res, next) => {
    if (req.isAuthenticated(req)) {
      return next();
    }
    return res.redirect('/');
  },

  authenticatedAdmin: (req, res, next) => {
    if (req.isAuthenticated(req)) {
      const user = JSON.parse(req.user);
      if (user.superuser === '1') {
        return next();
      }
      return res.redirect('/dashboards');
    }
    return res.redirect('/');
  },
};

module.exports = auth;
