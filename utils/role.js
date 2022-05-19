const { getPermission } = require('./auth');
const { rolePermission } = require('../utils/enums');

const adminRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (permission === rolePermission.admin) {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

const editorRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (
    permission === rolePermission.admin ||
    permission === rolePermission.editor
  ) {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

const viewerRole = async (req, res, next) => {
  const permission = await getPermission(req, res);
  if (
    permission === rolePermission.admin ||
    permission === rolePermission.editor ||
    permission === rolePermission.viewer
  ) {
    return next();
  } else {
    return res.redirect('/dashboards');
  }
};

module.exports = { adminRole, editorRole, viewerRole };
