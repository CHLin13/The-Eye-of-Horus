const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');
const { conditions } = require('../../utils/units');

const alertModel = {
  getAlerts: async () => {
    const sql =
      'SELECT alert.*, receiver.name AS rName, receiver.type as rType FROM alert inner join receiver ON alert.receiver_id = receiver.id';
    const [alert] = await pool.query(sql);
    return alert;
  },

  getReceiver: async () => {
    const sql = 'SELECT * FROM receiver';
    const [receiver] = await pool.query(sql);
    return receiver;
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

    const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const evalForInput = eval_for_input.match(/[a-zA-Z]+|[0-9]+/g);
    const str = 'smhdwMy';
    if (
      isNaN(value) ||
      isNaN(value_max) ||
      format.test(eval_for_input) ||
      evalForInput[0] < 0 ||
      !str.includes(evalForInput[1])
    ) {
      return false;
    }

    const [receiver] = await pool.query(`SELECT * FROM receiver WHERE id = ?`, [
      receiver_id,
    ]);

    let msgType = '';
    if (type) {
      msgType = type;
    }

    let alertMessage = `Warning from ${source} ${msgType}
condition: ${select} ${conditions[condition]} ${value} 
message: ${message}`;
    if (value_max) {
      alertMessage = `Warning from ${source} ${msgType}
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
      message: alertMessage,
      receiver_type: receiver[0].type,
      receiver_detail: receiver[0].detail,
    };

    const conn = await pool.getConnection();
    const [[originInput]] = await pool.query(
      `SELECT eval_every_input FROM alert WHERE id = ?`,
      [alertId]
    );

    try {
      if (alertId) {
        await conn.query(`UPDATE alert SET ? WHERE id = ?`, [mqlData, alertId]);
        await redis.HDEL(originInput.eval_every_input, alertId);
        await redis.HSET(eval_every_input, alertId, JSON.stringify(redisData));
      } else {
        const [result] = await conn.query(`INSERT INTO alert SET ?`, [mqlData]);
        const redisData = {
          id: result.insertId,
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
          receiver_type: receiver[0].type,
          receiver_detail: receiver[0].detail,
          message: alertMessage,
        };
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
    const [data] = await pool.query(sql, [alertId]);
    return data[0];
  },

  deleteAlert: async (alertId) => {
    const conn = await pool.getConnection();

    try {
      const [[eval_every_input]] = await pool.query(
        'SELECT eval_every_input FROM alert'
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
