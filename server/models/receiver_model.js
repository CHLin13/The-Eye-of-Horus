const pool = require('../../configs/mysqlConnect');

const receiverModel = {
  postReceiver: async (req) => {
    const { receiverId } = req.params;
    const { name, type, emailValue, webhookURL, idValue, tokenValue } =
      req.body;

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
    const data = { name: name, type: type, detail: JSON.stringify(detail) };
    
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
};

module.exports = receiverModel;
