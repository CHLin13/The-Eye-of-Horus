const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./mysqlConnect');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    const user = pool.query('SELECT * FROM user WHERE email = ?', [email]);

    if (!user) {
      return done(null, false, { message: 'Login failed' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: 'Login failed' });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const sql = `SELECT * FROM user 
    INNER JOIN user_role ON user.id = user_role.user_id
    INNER JOIN role ON user_role.role_id = role.id 
    WHERE id = ?`;
  const user = pool.query(sql, [id]);

  user = user.toJSON();
  return done(null, user);
});

module.exports = passport;
