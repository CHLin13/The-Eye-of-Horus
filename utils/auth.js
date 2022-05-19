const pool = require('../configs/mysqlConnect');

const authenticated = (req, res, next) => {
  if (req.isAuthenticated(req)) {
    return next();
  }
  return res.redirect('/');
};

const authenticatedSuper = (req, res, next) => {
  if (req.isAuthenticated(req)) {
    const user = JSON.parse(req.user);
    if (user.superuser === '1') {
      return next();
    }
    return res.redirect('/dashboards');
  }
  return res.redirect('/');
};

const getPermission = async (req, res) => {
  const user = res.locals.localUser;
  const superuser = user.superuser;
  let role = '';
  if (superuser === '1') {
    role = '3';
  } else {
    const userId = user.id;
    const dashboardId = req.params.dashboardId;
    const sql = `SELECT permission FROM dashboard_permission 
      INNER JOIN user_role ON user_role.role_id = dashboard_permission.role_id
      WHERE user_role.user_id = ? AND dashboard_permission.dashboard_id = ?`;
    const [permission] = await pool.query(sql, [userId, dashboardId]);
    if (permission.length < 1) {
      return false;
    }

    role = permission.reduce((accu, curr) => {
      if (!accu.permission) {
        accu.permission = curr.permission;
      }
      if (Number(curr.permission) > Number(accu.permission)) {
        accu.permission = curr.permission;
      }
      return accu;
    }, {}).permission;
  }

  return role;
};

module.exports = {
  authenticated,
  authenticatedSuper,
  getPermission,
};
