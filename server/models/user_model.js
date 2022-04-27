const pool = require('../../configs/mysqlConnect');

const userModel = {
  getUsers: async () => {
    const sql = 'SELECT * FROM user';
    const [role] = await pool.query(sql);
    return role;
  },

  postUser: async (name, email, password, admin, status, userId) => {
    const data = {
      name: name,
      email: email,
      password: password,
      admin: admin,
      status: status,
    };

    const update = {
      name: name,
      email: email,
      admin: admin,
      status: status,
    };

    const conn = await pool.getConnection();

    try {
      if (userId) {
        await conn.query(`UPDATE user SET ? WHERE id = ?`, [update, userId]);
      } else {
        await conn.query(`INSERT INTO user SET ?`, [data]);
      }
      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  getUser: async (userId) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    const [data] = await pool.query(sql, [userId]);
    return data[0];
  },

  deleteUser: async (userId) => {
    const conn = await pool.getConnection();
    try {
      const sql = 'DELETE FROM user WHERE id = ?';
      await conn.query(sql, [userId]);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = userModel;
