require('dotenv').config();
const redis = require('./configs/redisConnect');
const pool = require('./configs/mysqlConnect');
const Influxdb = require('influx');
const axios = require('axios');
const mailgun = require('mailgun-js');
const DOMAIN = 'baboo.shop';
const units = require('./utils/units');

const mg = mailgun({
  apiKey: process.env.MGAPIKEY,
  domain: DOMAIN,
});
const { WebhookClient } = require('discord.js');

const work = (async function () {
  const response = await redis.hGetAll('1m');
  const result = Object.values(response).map((response) =>
    JSON.parse(response)
  );

  for (let i = 0; i < result.length; i++) {
    const database = result[i].source.split('/')[0];
    const measurement = result[i].source.split('/')[1];
    const influxdb = new Influxdb.InfluxDB(process.env.URL + database);

    const everyArr = result[i].eval_every_input.match(/[a-zA-Z]+|[0-9]+/g);
    const forArr = result[i].eval_for_input.match(/[a-zA-Z]+|[0-9]+/g);
    const limit = Math.floor(
      (forArr[0] * units.timeUnits[forArr[1]]) /
        (everyArr[0] * units.timeUnits[everyArr[1]])
    );

    let influxSql = '';
    if (result[i].type) {
      influxSql = `select ${result[i].select}(*) from ${measurement} WHERE type_instance = '${result[i].type}' GROUP BY time(${result[i].eval_every_input}) order by DESC limit ${limit}`;
    } else {
      influxSql = `select ${result[i].select}(*) from ${measurement} GROUP BY time(${result[i].eval_every_input}) order by DESC limit ${limit}`;
    }

    const system = await influxdb.query(influxSql);
    const select = result[i].select + '_value';

    class checkerMax {
      constructor(value_max) {
        this.value_max = value_max;
      }

      check(threshold) {
        return threshold > this.value_max ? 1 : 0;
      }
    }

    class checkerMin {
      constructor(value_min) {
        this.value_min = value_min;
      }

      check(threshold) {
        return threshold < this.value_min;
      }
    }

    class checkerOutside {
      constructor(value_min, value_max) {
        this.value_min = value_min;
        this.value_max = value_max;
      }

      check(threshold) {
        return threshold < this.value_min || threshold > this.value_max;
      }
    }

    class checkerBetween {
      constructor(value_min, value_max) {
        this.value_min = value_min;
        this.value_max = value_max;
      }

      check(threshold) {
        return threshold > this.value_min && threshold < this.value_max;
      }
    }

    class checkerNoValue {
      check(threshold) {
        return threshold === null;
      }
    }

    let checker = null;
    let count = 0;
    switch (Number(result[i].condition)) {
      case 1:
        checker = new checkerMax(result[i].value);
        break;
      case 2:
        checker = new checkerMin(result[i].value);
        break;
      case 3:
        checker = new checkerOutside(result[i].value, result[i].value_max);
        break;
      case 4:
        checker = new checkerBetween(result[i].value, result[i].value_max);
        break;
      case 5:
        checker = new checkerNoValue();
        break;
    }
    for (let j = 0; j < limit; j++) {
      count += checker.check(system[j][select]);
    }

    let status = 0;
    if (count > 0 && count < limit) {
      status = 1;
    } else {
      status = 2;
    }

    const conn = await pool.getConnection();
    try {
      await conn.query(`UPDATE alert SET status = ? WHERE id = ?`, [
        status,
        result[i].id,
      ]);
    } catch (error) {
      await conn.query('ROLLBACK');
      return { error };
    } finally {
      conn.release();
    }

    const notify = {
      Email: async function sendEmail(email, message) {
        const data = {
          from: 'The Eye of Horus <TheEyeofHorus@baboo.shop>',
          to: email,
          subject: 'Alert from The Eye of Horus',
          html: `<h1>${message}</h1>`,
        };
        try {
          await mg.messages().send(data);
        } catch (error) {
          console.log('email error');
        }
      },
      Slack: async function slackNotify(url, message) {
        try {
          await axios.post(url, {
            text: message,
            icon_url: 'https://i.imgur.com/euLn4Te.png',
            username: ' The-Eye-of-Horus',
          });
        } catch (error) {
          console.log('slack error');
        }
      },
      Discord: async function discordNotify(id, message, token) {
        const webhookClient = new WebhookClient({
          id: id,
          token: token,
        });
        try {
          await webhookClient.send({
            content: message,
            username: 'The-Eye-of-Horus',
            avatarURL: 'https://i.imgur.com/euLn4Te.png',
          });
        } catch (error) {
          console.log('discord error');
        }
      },
    };
    const detail = JSON.parse(result[i].receiver_detail);
    const errorMessage = result[i].message;

    if (count === limit) {
      notify[result[i].receiver_type](detail[0], errorMessage, detail[1]);
    }
  }
})();

console.log('1m-working');
