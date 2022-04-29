const admin = require('./admin_route');
const dashboard = require('./dashboard_route');
const profile = require('./profile_route');
const login = require('./sign_route');
const alert = require('./alert_route');
const receiver = require('./receiver_route');
const apps = require('./app_route');

module.exports = (app) => {
  app.use('/', login);
  app.use('/admin', admin);
  app.use('/dashboards', dashboard);
  app.use('/profile', profile);
  app.use('/alerts', alert);
  app.use('/receivers', receiver);
  app.use('/app', apps);
};
