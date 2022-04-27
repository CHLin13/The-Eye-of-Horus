const axios = require('axios');
const DOMAIN = 'baboo.shop';
const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: process.env.MGAPIKEY,
  domain: DOMAIN,
});
const { WebhookClient } = require('discord.js');

module.exports = {
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
      console.log({ error: error });
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
      // console.log({ error: error });
      console.log('discord error');
    }
  },
};
