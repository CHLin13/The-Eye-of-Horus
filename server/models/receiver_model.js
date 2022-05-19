const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');
const { conditions, conditionLabel } = require('../../utils/enums');

const receiverModel = {
  getReceiver: async (receiverId) => {
    let sql = 'SELECT * FROM receiver';

    if (receiverId) {
      sql = 'SELECT * FROM receiver WHERE id = ?';
    }

    const [receiver] = await pool.query(sql, [receiverId]);
    receiver.map((receiver) => {
      receiver.detail = JSON.parse(receiver.detail);
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
      mediaType,
      emailValue,
      webhookURL,
      idValue,
      tokenValue,
    } = req.body;
    const types = ['Email', 'Slack', 'Discord'];
    if (!types.some((type) => type === mediaType)) {
      req.flash('error_messages', 'Type is incorrect');
      if (receiverId) {
        return `/receivers/${receiverId}`;
      } else {
        return '/receivers/create';
      }
    }

    if (
      (mediaType === 'Email' && emailValue === '') ||
      (mediaType === 'Slack' && webhookURL === '') ||
      (mediaType === 'Discord' && idValue === '') ||
      (mediaType === 'Discord' && tokenValue === '')
    ) {
      req.flash('error_messages', 'All fields are required');
      if (receiverId) {
        return `/receivers/${receiverId}`;
      } else {
        return '/receivers/create';
      }
    }

    const mediaProperties = [];
    if (mediaType === 'Email' && emailValue !== '') {
      mediaProperties.push(emailValue);
    } else if (mediaType === 'Slack' && webhookURL !== '') {
      mediaProperties.push(webhookURL);
    } else if (mediaType === 'Discord' && idValue !== '' && tokenValue !== '') {
      mediaProperties.push(idValue);
      mediaProperties.push(tokenValue);
    } else {
      return false;
    }

    const data = {
      name: name,
      description: description,
      type: mediaType,
      detail: JSON.stringify(mediaProperties),
    };

    const [alerts] = await pool.query(
      'SELECT * FROM alert WHERE receiver_id = ?',
      [receiverId]
    );

    const conn = await pool.getConnection();

    try {
      if (receiverId) {
        await conn.query('UPDATE receiver SET ? WHERE id = ?', [
          data,
          receiverId,
        ]);
        await Promise.all(
          alerts.forEach(async (alert) => {
            const {
              id,
              name,
              source,
              type,
              select,
              condition,
              value,
              value_max,
              eval_every_input,
              eval_for_input,
              message,
            } = alert;
            console.log(message);
            let msgType = type;
            if (!type || type === null) {
              msgType = ' ';
            }
            let alertMessage = '';
            if (
              condition === conditions.GREATER ||
              condition === conditions.LESS
            ) {
              alertMessage = `Warning from ${source} ${msgType}
          condition: ${select} ${conditionLabel[condition]} ${value}
          message: ${message}`;
            } else if (
              condition === conditions.OUTSIDE ||
              condition === conditions.BETWEEN
            ) {
              alertMessage = `Warning from ${source} ${msgType}
          condition: ${select} ${conditionLabel[condition]} ${value} & ${value_max}
          message: ${message}`;
            } else if (condition === conditions.noVALUE) {
              alertMessage = `Warning from ${source} ${msgType}
          condition: ${select} ${conditionLabel[condition]}
          message: ${message}`;
            }

            const redisData = {
              id: id,
              name: name,
              source: source,
              type: type,
              select: select,
              condition: condition,
              value: Number(value),
              value_max: Number(value_max),
              eval_every_input: eval_every_input,
              eval_for_input: eval_for_input,
              receiver_id: receiverId,
              receiver_type: mediaType,
              receiver_detail: JSON.stringify(mediaProperties),
              message: alertMessage,
            };
            await redis.HSET(eval_every_input, id, JSON.stringify(redisData));
          })
        );
      } else {
        await conn.query('INSERT INTO receiver SET ?', [data]);
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
    const [alerts] = await pool.query(
      'SELECT distinct alert.id, alert.eval_every_input FROM alert INNER JOIN receiver WHERE alert.receiver_id = ?',
      [receiverId]
    );

    const conn = await pool.getConnection();

    try {
      const sql = 'DELETE FROM receiver WHERE id = ?';
      await conn.query(sql, [receiverId]);
      await Promise.all(
        alerts.forEach(async (alert) => {
          await redis.HDEL(alert.eval_every_input, alert.id);
        })
      );
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = receiverModel;
