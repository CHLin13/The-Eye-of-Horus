const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');
const { conditions } = require('../../utils/enums');

const alertModel = {
  getAlerts: async () => {
    const sql =
      'SELECT alert.*, receiver.name AS rName, receiver.type as rType FROM alert inner join receiver ON alert.receiver_id = receiver.id';
    const [alerts] = await pool.query(sql);
    return alerts;
  },

  getReceivers: async () => {
    const sql = 'SELECT * FROM receiver';
    const [receivers] = await pool.query(sql);
    return receivers;
  },

  postAlert: async (req) => {
    const { alertId } = req.params;
    const {
      name,
      source,
      type,
      select,
      condition,
      value,
      value_max,
      eval_every_input,
      eval_for_input,
      receiver_id,
      message,
    } = req.body;
    const [[receiver]] = await pool.query(
      'SELECT * FROM receiver WHERE id = ?',
      [receiver_id]
    );

    // eslint-disable-next-line no-useless-escape
    const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const evalForInput = eval_for_input.match(/[a-zA-Z]+|[0-9]+/g);
    const timeUnits = 'smhdwMy';
    if (
      isNaN(value) ||
      isNaN(value_max) ||
      format.test(eval_for_input) ||
      evalForInput[0] < 0 ||
      !timeUnits.includes(evalForInput[1])
    ) {
      return false;
    }

    let typeInstance = '';
    if (type) {
      typeInstance = type;
    }

    let alertMessage = `Warning from ${source} ${typeInstance}
condition: ${select} ${conditions[condition]} ${value} 
message: ${message}`;
    if (value_max) {
      alertMessage = `Warning from ${source} ${typeInstance}
condition: ${select} ${conditions[condition]} ${value} & ${value_max} 
message: ${message}`;
    }

    const mqlData = {
      name: name,
      source: source,
      type: type,
      select: select,
      condition: condition,
      value: Number(value),
      value_max: Number(value_max),
      eval_every_input: eval_every_input,
      eval_for_input: eval_for_input,
      receiver_id: receiver_id,
      message: message,
      status: 0,
    };
    const redisData = {
      id: alertId,
      name: name,
      source: source,
      type: type,
      select: select,
      condition: condition,
      value: Number(value),
      value_max: Number(value_max),
      eval_every_input: eval_every_input,
      eval_for_input: eval_for_input,
      receiver_id: receiver_id,
      receiver_type: receiver.type,
      receiver_detail: receiver.detail,
      message: alertMessage,
    };

    const conn = await pool.getConnection();
    try {
      if (alertId) {
        const [[originEvalEveryInput]] = await pool.query(
          'SELECT eval_every_input FROM alert WHERE id = ?',
          [alertId]
        );
        await conn.query('UPDATE alert SET ? WHERE id = ?', [mqlData, alertId]);
        await redis.HDEL(originEvalEveryInput.eval_every_input, alertId);
        await redis.HSET(eval_every_input, alertId, JSON.stringify(redisData));
      } else {
        const [result] = await conn.query('INSERT INTO alert SET ?', [mqlData]);
        redisData.id = result.insertId;
        await redis.HSET(
          eval_every_input,
          result.insertId,
          JSON.stringify(redisData)
        );
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

  getAlert: async (alertId) => {
    const sql = 'SELECT * FROM alert WHERE id = ?';
    const [[alert]] = await pool.query(sql, [alertId]);
    return alert;
  },

  deleteAlert: async (alertId) => {
    const conn = await pool.getConnection();
    try {
      const [[eval_every_input]] = await pool.query(
        'SELECT eval_every_input FROM alert WHERE id = ?',
        [alertId]
      );
      const sql = 'DELETE FROM alert WHERE id = ?';
      await conn.query(sql, [alertId]);
      await redis.HDEL(eval_every_input.eval_every_input, alertId);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }
  },
};

module.exports = alertModel;
