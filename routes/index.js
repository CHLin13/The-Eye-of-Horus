const admin = require('./admin');
const dashboard = require('./dashboard');
const profile = require('./profile');
const login = require('./login');

module.exports = (app) => {
  app.use('/', login);
  app.use('/admin', admin);
  app.use('/dashboards', dashboard);
  app.use('/profile', profile);
};
