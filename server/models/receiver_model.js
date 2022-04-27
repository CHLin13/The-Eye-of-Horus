const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');

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

    const [alert] = await pool.query(
      `SELECT * FROM alert WHERE receiver_id = ?`,
      [receiverId]
    );

    const conn = await pool.getConnection();

    try {
      if (receiverId) {
        await conn.query(`UPDATE receiver SET ? WHERE id = ?`, [
          data,
          receiverId,
        ]);
        for (let i = 0; i < alert.length; i++) {
          const redisData = {
            id: alert[i].id,
            name: alert[i].name,
            source: alert[i].source,
            type: alert[i].type,
            select: alert[i].select,
            condition: alert[i].condition,
            value: Number(alert[i].value),
            value_max: Number(alert[i].value_max),
            eval_every_input: alert[i].eval_every_input,
            eval_for_input: alert[i].eval_for_input,
            message: alert[i].message,
            receiver_id: receiverId,
            receiver_type: type,
            receiver_detail: detail,
          };
          await redis.HSET(
            alert[i].eval_every_input,
            alert[i].id,
            JSON.stringify(redisData)
          );
        }
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
