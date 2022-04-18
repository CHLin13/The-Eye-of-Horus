const db = require('../../configs/mysqlConnect');
const Influxdb = require('influx');
const influx = new Influxdb.InfluxDB(process.env.URL);

const getSource = async () => {
  const idb = await influx.getDatabaseNames();
  const newDB = idb.slice(1);
  const measurements = [];
  for (let i = 0; i < newDB.length; i++) {
    const measurement = await influx.getMeasurements(newDB[i]);
    measurements.push(measurement);
  }
  let source = [];
  for (let i = 0; i < newDB.length; i++) {
    source.push(
      measurements[i].map((measurement) => newDB[i] + '/' + measurement)
    );
  }
  source = source.flat();
  return source;
};

// const createOrder = async (order) => {
//   const [result] = await pool.query('INSERT INTO order_table SET ?', order);
//   return result.insertId;
// };

// const createPayment = async function (orderId, payment) {
//   const conn = await pool.getConnection();
//   try {
//     await conn.query('START TRANSACTION');
//     await conn.query('INSERT INTO payment SET ?', payment);
//     await conn.query('UPDATE order_table SET status = ? WHERE id = ?', [
//       0,
//       orderId,
//     ]);
//     await conn.query('COMMIT');
//     return true;
//   } catch (error) {
//     await conn.query('ROLLBACK');
//     return { error };
//   } finally {
//     conn.release();
//   }
// };



// const getUserPaymentsGroupByDB = async () => {
//   const [orders] = await pool.query(
//     'SELECT user_id, SUM(total) as total_payment FROM order_table GROUP BY user_id'
//   );
//   return orders;
// };

module.exports = {
  getSource,
};
