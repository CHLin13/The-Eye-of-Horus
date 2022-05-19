const pool = require('../../configs/mysqlConnect');

const roleModel = {
  getRoles: async () => {
    const sql = 'SELECT * FROM role';
    const [role] = await pool.query(sql);
    return role;
  },

  postRole: async (roleId, name, description) => {
    const data = {
      name: name,
      description: description,
    };

    const conn = await pool.getConnection();
    try {
      if (roleId) {
        await conn.query('UPDATE role SET ? WHERE id = ?', [data, roleId]);
      } else {
        await conn.query('INSERT INTO role SET ?', [data]);
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

  getRole: async (roleId) => {
    const sql = 'SELECT * FROM role WHERE id = ?';
    const [data] = await pool.query(sql, [roleId]);
    return data[0];
  },

  deleteRole: async (roleId) => {
    const conn = await pool.getConnection();
    try {
      const sql = 'DELETE FROM role WHERE id = ?';
      await conn.query(sql, [roleId]);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = roleModel;
