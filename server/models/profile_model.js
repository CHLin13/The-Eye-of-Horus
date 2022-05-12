const pool = require('../../configs/mysqlConnect');

const profileModel = {
  getPassword: async (userId) => {
    const sql = 'SELECT password FROM user WHERE id = ?';
    const [[password]] = await pool.query(sql, [userId]);
    return password;
  },

  postProfile: async (name, email, hashedPassword, userId) => {
    const data = {
      name: name,
      email: email,
      password: hashedPassword,
    };
    const [exist] = await pool.query(`SELECT email FROM user WHERE email = ?`, [
      email,
    ]);

    if (exist.length > 0 && exist[0].email !== email) {
      return false;
    }
    const conn = await pool.getConnection();

    try {
      await conn.query(`UPDATE user SET ? WHERE id = ?`, [data, userId]);
      await conn.query('COMMIT');
      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = profileModel;
