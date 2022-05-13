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
      if (!user || user.status !== '1') {
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
  const sql = `SELECT user.id, user.email, user.name, user.superuser ,user.status, role.id as role_id, role.name as role_name FROM user 
    LEFT JOIN user_role ON user.id = user_role.user_id
    LEFT JOIN role ON user_role.role_id = role.id 
    WHERE user.id = ?`;
  const [user] = await pool.query(sql, [id]);
  
  if(user[0].role_id !== null){
    const role_id = [];
    const role_name = [];
    user.forEach((user) => {
      role_id.push(user.role_id);
      role_name.push(user.role_name);
    });
    user[0].role_id = role_id;
    user[0].role_name = role_name;
  }

  const userJSON = JSON.stringify(user[0]);
  return done(null, userJSON);
});

module.exports = passport;
