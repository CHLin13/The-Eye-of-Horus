const pool = require('../../configs/mysqlConnect');

const receiverModel = {
  getReceiver: async (receiverId) => {
    let sql = 'SELECT * FROM receiver';

    if (receiverId) {
      sql = 'SELECT * FROM receiver WHERE id = ?';
    }

    const [receiver] = await pool.query(sql, [receiverId]);
    receiver.map((receiver) => (receiver.detail = JSON.parse(receiver.detail)));
    receiver.map((receiver) => {
      receiver.d0 = receiver.detail[0];
      receiver.d1 = receiver.detail[1];
    });

    return receiver;
  },

  postReceiver: async (req) => {
    const { receiverId } = req.params;
    const {
      name,
      description,
      type,
      emailValue,
      webhookURL,
      idValue,
      tokenValue,
    } = req.body;

    const detail = [];
    if (emailValue !== '') {
      detail.push(emailValue);
    } else if (webhookURL !== '') {
      detail.push(webhookURL);
    } else if (idValue !== '' && tokenValue !== '') {
      detail.push(idValue);
      detail.push(tokenValue);
    } else {
      return { error };
    }

    const data = {
      name: name,
      description: description,
      type: type,
      detail: JSON.stringify(detail),
    };

    const conn = await pool.getConnection();

    try {
      if (receiverId) {
        await conn.query(`UPDATE receiver SET ? WHERE id = ?`, [
          data,
          receiverId,
        ]);
      } else {
        await conn.query(`INSERT INTO receiver SET ?`, [data]);
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

  deleteReceiver: async (receiverId) => {
    const conn = await pool.getConnection();
    
    try {
      const sql = 'DELETE FROM receiver WHERE id = ?';
      await conn.query(sql, [receiverId]);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = receiverModel;
