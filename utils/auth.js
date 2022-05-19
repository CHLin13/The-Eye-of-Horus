const { rolePermission, superPermission } = require('./enums');
const pool = require('../configs/mysqlConnect');

const authenticated = (req, res, next) => {
  if (req.isAuthenticated(req)) {
    return next();
  }
  return res.redirect('/');
};

const authenticatedSuper = (req, res, next) => {
  if (req.isAuthenticated(req)) {
    const superuser = res.locals.localUser.superuser;
    if (superuser === superPermission.true) {
      return next();
    }
    return res.redirect('/dashboards');
  }
  return res.redirect('/');
};

const getPermission = async (req, res) => {
  const { superuser, id } = res.locals.localUser;
  let role = '';
  
  if (superuser === superPermission.true) {
    role = rolePermission.admin;
  } else {
    const dashboardId = req.params.dashboardId;
    const sql = `SELECT permission FROM dashboard_permission 
      INNER JOIN user_role ON user_role.role_id = dashboard_permission.role_id
      WHERE user_role.user_id = ? AND dashboard_permission.dashboard_id = ?`;
    const [permission] = await pool.query(sql, [id, dashboardId]);

    if (permission.length < 1) {
      return false;
    }

    role = permission.reduce((acc, curr) => {
      if (!acc.permission) {
        acc.permission = curr.permission;
      }
      if (Number(curr.permission) > Number(acc.permission)) {
        acc.permission = curr.permission;
      }
      return acc;
    }, {}).permission;
  }

  return role;
};

module.exports = {
  authenticated,
  authenticatedSuper,
  getPermission,
};
