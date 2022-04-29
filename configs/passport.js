const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./mysqlConnect');

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const [[user]] = await pool.query('SELECT * FROM user WHERE email = ?', [
        email,
      ]);

      if (!user) {
        return done(null, false, { message: 'Login failed' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Login failed' });
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const sql = `SELECT user.id, user.email, user.name, user.superuser ,user.status, role.id as role_id FROM user 
    INNER JOIN user_role ON user.id = user_role.user_id
    INNER JOIN role ON user_role.role_id = role.id 
    WHERE user.id = ?`;
  const [[user]] = await pool.query(sql, [id]);
  const userJSON = JSON.stringify(user);
  return done(null, userJSON);
});

module.exports = passport;
