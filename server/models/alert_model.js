const pool = require('../../configs/mysqlConnect');
const redis = require('../../configs/redisConnect');

const alertModel = {
  getAlerts: async () => {
    const sql = 'SELECT * FROM alert';
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

    const [receiver] = await pool.query(`SELECT * FROM receiver WHERE id = ?`, [
      receiver_id,
    ]);

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
      message: message,
    };

    const conn = await pool.getConnection();

    try {
      if (alertId) {
        await conn.query(`UPDATE alert SET ? WHERE id = ?`, [mqlData, alertId]);
        await redis.HSET(eval_every_input, alertId, JSON.stringify(redisData));
      } else {
        const [result] = await conn.query(`INSERT INTO alert SET ?`, [mqlData]);
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
  }
};

module.exports = alertModel;
