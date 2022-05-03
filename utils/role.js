const adminRole = async (req, res, next) => {
  const permission = res.locals.role;
  if (permission === '3') {
    return next();
  } else {
    return res.redirect('/');
  }
};

const editorRole = async (req, res, next) => {
  const permission = res.locals.role;
  if (permission === '3' || permission === '2') {
    return next();
  } else {
    return res.redirect('/');
  }
};

const viewerRole = async (req, res, next) => {
  const permission = res.locals.role;
  if (permission === '3' || permission === '2' || permission === '1') {
    return next();
  } else {
    return res.redirect('/');
  }
};

module.exports = { adminRole, editorRole, viewerRole };
