const { rolePermission } = require('../utils/enums');
const attachPermission = async (dashboards, userRoles) => {
  dashboards.forEach((dashboard) => {
    
    // build {role:permission} hash table to each dashboard
    const dashboardPermission = {};
    if (dashboard.role_id) {
      dashboard['role_id'].forEach((roleId, i) => {
        dashboardPermission[roleId] = dashboard.permission[i];
      });
    }

    // compare user role to dashboard permission
    if (userRoles) {
      userRoles.forEach((userRole) => {
        if (dashboardPermission[userRole] === rolePermission.admin) {
          dashboard.adminPermission = true;
          dashboard.editPermission = true;
          dashboard.viewPermission = true;
        } else if (dashboardPermission[userRole] === rolePermission.editor) {
          dashboard.editPermission = true;
          dashboard.viewPermission = true;
        } else if (dashboardPermission[userRole] === rolePermission.viewer) {
          dashboard.viewPermission = true;
        }
      });
    }
  });

  return dashboards;
};

module.exports = {
  attachPermission,
};
