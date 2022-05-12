const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');
const { conditions } = require('../../utils/units');

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

    if (type !== 'Email' && type !== 'Slack' && type !== 'Discord') {
      req.flash('error_messages', 'Type is incorrect');
      if (receiverId) {
        return `/receivers/${receiverId}`;
      } else {
        return `/receivers/create`;
      }
    }

    if (
      (type === 'Email' && emailValue === '') ||
      (type === 'Slack' && webhookURL === '') ||
      (type === 'Discord' && idValue === '' && tokenValue === '')
    ) {
      req.flash('error_messages', 'All fields are required');
      if (receiverId) {
        return `/receivers/${receiverId}`;
      } else {
        return `/receivers/create`;
      }
    }

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
          let msgType = alert[i].type;
          console.log(alert[i].type);
          if (!alert[i].type || alert[i].type === null) {
            msgType = ' ';
          }

          let alertMessage = `Warning from ${alert[i].source} ${msgType}
condition: ${alert[i].select} ${conditions[alert[i].condition]} ${
            alert[i].value
          } 
message: ${alert[i].message}`;
          if (alert[i].condition === '3' || alert[i].value === '4') {
            alertMessage = `Warning from ${alert[i].source} ${msgType}
condition: ${alert[i].select} ${conditions[alert[i].condition]} ${
              alert[i].value
            } & ${alert[i].value_max} 
message: ${alert[i].message}`;
          } else if (alert[i].condition === '5') {
            alertMessage = `Warning from ${alert[i].source} ${msgType}
condition: ${alert[i].select} ${conditions[alert[i].condition]}
message: ${alert[i].message}`;
          }

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
            receiver_id: receiverId,
            receiver_type: type,
            receiver_detail: JSON.stringify(detail),
            message: alertMessage,
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
      return '/receivers';
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },

  deleteReceiver: async (receiverId) => {
    const [alert] = await pool.query(
      'SELECT distinct alert.id, alert.eval_every_input FROM alert INNER JOIN receiver WHERE alert.receiver_id = ?',
      [receiverId]
    );

    const conn = await pool.getConnection();

    try {
      const sql = 'DELETE FROM receiver WHERE id = ?';
      await conn.query(sql, [receiverId]);

      for (let i = 0; i < alert.length; i++) {
        await redis.HDEL(alert[i].eval_every_input, alert[i].id);
      }
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = receiverModel;
