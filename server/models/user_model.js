const pool = require('../../configs/mysqlConnect');

const userModel = {
  getUsers: async () => {
    const sql = 'SELECT * FROM user';
    const [role] = await pool.query(sql);
    return role;
  },

  postUser: async (name, email, password, superuser, status, role, userId) => {
    userId = Number(userId);
    const data = {
      name: name,
      email: email,
      password: password,
      superuser: superuser,
      status: status,
    };

    const update = {
      name: name,
      email: email,
      superuser: superuser,
      status: status,
    };

    const conn = await pool.getConnection();

    try {
      if (userId) {
        await conn.query('UPDATE user SET ? WHERE id = ?', [data, userId]);
        await conn.query('DELETE FROM user_role WHERE user_id = ?', [userId]);
      } else {
        const [[alreadyRegistered]] = await conn.query(
          'SELECT email FROM user WHERE email = ?',
          [email]
        );
        if (exist.length > 0) {
          return false;
        }
        const [user] = await conn.query('INSERT INTO user SET ?', [data]);
        userId = user.insertId;
      }

      const user_role = role.map((role) => {
        const arr = [];
        arr.push(userId);
        arr.push(Number(role));
        return arr;
      });
      if (user_role.length !== 0) {
        await conn.query(`INSERT INTO user_role (user_id, role_id) VALUES ?`, [
          user_role,
        ]);
      }

      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      console.log(error);
    } finally {
      conn.release();
    }
  },

  getUser: async (userId) => {
    const sql =
      'SELECT user.*, user_role.role_id  FROM user LEFT JOIN user_role ON user.id = user_role.user_id WHERE user.id = ?';
    const [data] = await pool.query(sql, [userId]);
    const role = data.map((data) => data.role_id);
    if (data.length === 0) {
      return false;
    }
    data[0].role_id = role;
    return data[0];
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
