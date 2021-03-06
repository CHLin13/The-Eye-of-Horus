module.exports = {
  conditions: {
    1: 'GREATER',
    2: 'LESS',
    3: 'OUTSIDE',
    4: 'BETWEEN',
    5: 'noVALUE',
  },

  conditionLabel: {
    1: 'GREATER THAN >',
    2: 'LESS THAN <',
    3: 'IS OUTSIDE',
    4: 'IS BETWEEN',
    5: 'HAS NO VALUE',
  },

  rolePermission: {
    viewer: '1',
    editor: '2',
    admin: '3',
  },

  superPermission: {
    true: '1',
    false: '0',
  },

  userStatus: {
    active: '1',
    inactive: '0',
  },
};
