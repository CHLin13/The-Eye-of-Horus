const admin = require('./admin_route');
const dashboard = require('./dashboard_route');
const profile = require('./profile_route');
const login = require('./login_route');

module.exports = (app) => {
  app.use('/', login);
  app.use('/admin', admin);
  app.use('/dashboards', dashboard);
  app.use('/profile', profile);
};
