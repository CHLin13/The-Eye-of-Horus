const attachPermission = async (dashboard, userRole) => {
  for (let i = 0; i < dashboard.length; i++) {
    const obj = {};

    for (let j = 0; j < dashboard[i].role_id.length; j++) {
      obj[dashboard[i].role_id[j]] = dashboard[i].permission[j];
    }

    if (userRole) {
      for (let k = 0; k < userRole.length; k++) {
        if (obj[userRole[k]] === '3') {
          dashboard[i].adminPermission = true;
          dashboard[i].editPermission = true;
          dashboard[i].viewPermission = true;
        } else if (obj[userRole[k]] === '2') {
          dashboard[i].editPermission = true;
          dashboard[i].viewPermission = true;
        } else if (obj[userRole[k]] === '1') {
          dashboard[i].viewPermission = true;
        }
      }
    }
  }
  return dashboard;
};

module.exports = {
  attachPermission,
};
