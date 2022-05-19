//TODO:refector
const { getPermission } = require('./auth');
const adminRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (permission === '3') {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

const editorRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (permission === '3' || permission === '2') {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

const viewerRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (permission === '3' || permission === '2' || permission === '1') {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

module.exports = { adminRole, editorRole, viewerRole };
