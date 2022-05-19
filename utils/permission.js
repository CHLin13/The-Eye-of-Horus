const { rolePermission } = require('../utils/enums');
const attachPermission = async (dashboards, userRoles) => {
  for (let i = 0; i < dashboards.length; i++) {
    const obj = {};

    for (let j = 0; j < dashboards[i].role_id.length; j++) {
      obj[dashboards[i].role_id[j]] = dashboards[i].permission[j];
    }
    if (userRoles) {
      for (let k = 0; k < userRoles.length; k++) {
        if (obj[userRoles[k]] === rolePermission.admin) {
          dashboards[i].adminPermission = true;
          dashboards[i].editPermission = true;
          dashboards[i].viewPermission = true;
        } else if (obj[userRoles[k]] === rolePermission.editor) {
          dashboards[i].editPermission = true;
          dashboards[i].viewPermission = true;
        } else if (obj[userRoles[k]] === rolePermission.viewer) {
          dashboards[i].viewPermission = true;
        }
      }
    }
  }
  return dashboards;
};

module.exports = {
  attachPermission,
};
