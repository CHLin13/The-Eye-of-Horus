require('dotenv').config();
const redis = require('redis');
const { REDIS_USER, REDIS_PASSWORD, REDIS_URL, REDIS_PORT } = process.env;

const redisClient = redis.createClient({
  url: `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_URL}:${REDIS_PORT}`,
  legacyMode: true,
});

redisClient.ready = false;

redisClient.on('ready', () => {
  redisClient.ready = true;
  console.log('Redis is ready');
});

redisClient.on('error', () => {
  redisClient.ready = false;
  console.log('Error in Redis');
});

redisClient.on('end', () => {
  redisClient.ready = false;
  console.log('Redis is disconnected');
});

module.exports = redisClient;
