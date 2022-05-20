const pool = require('../../configs/mysqlConnect');

const userModel = {
  getUsers: async () => {
    const sql = 'SELECT * FROM user';
    const [users] = await pool.query(sql);
    return users;
  },

  postUser: async (name, email, password, superuser, status, roles, userId) => {
    
    const data = {
      name: name,
      email: email,
      superuser: superuser,
      status: status,
    };

    const conn = await pool.getConnection();

    try {
      if (userId) {
        userId = Number(userId);
        await conn.query('UPDATE user SET ? WHERE id = ?', [data, userId]);
        await conn.query('DELETE FROM user_role WHERE user_id = ?', [userId]);
      } else {
        const [[alreadyRegistered]] = await conn.query(
          'SELECT email FROM user WHERE email = ?',
          [email]
        );
        if (alreadyRegistered) {
          return false;
        }
        //Insert default password
        data.password = password
        const [user] = await conn.query('INSERT INTO user SET ?', [data]);
        userId = user.insertId;
      }

      const user_role = roles.map((role) => [userId, Number(role)]);

      if (user_role.length > 0) {
        await conn.query('INSERT INTO user_role (user_id, role_id) VALUES ?', [
          user_role,
        ]);
      }

      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      console.log(error);
      return false;
    } finally {
      conn.release();
    }
  },

  getUser: async (userId) => {
    const sql =
      'SELECT user.*, user_role.role_id  FROM user LEFT JOIN user_role ON user.id = user_role.user_id WHERE user.id = ?';
    const [user] = await pool.query(sql, [userId]);

    if (user.length === 0) {
      return false;
    }

    user[0].role_id = user.map((item) => item.role_id);
    return user[0];
  },

  deleteUser: async (userId) => {
    const conn = await pool.getConnection();
    try {
      const sql = 'DELETE FROM user WHERE id = ?';
      await conn.query(sql, [userId]);
    } catch (error) {
      await conn.query('ROLLBACK');
      console.log(error);
    } finally {
      conn.release();
    }
  },
};

module.exports = userModel;
