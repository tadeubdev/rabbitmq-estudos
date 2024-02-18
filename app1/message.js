const amqp = require('amqplib');

const user = process.env.RABBITMQ_USER || 'user';
const password = process.env.RABBITMQ_PASSWORD || 'password';
const host = process.env.RABBITMQ_HOST || 'rabbitmq';
const CONNECT_STRING = `amqp://${user}:${password}@${host}`;

async function publishMessage(queue, message) {
  return new Promise(async (resolve, reject) => {
    const conn = await amqp.connect(CONNECT_STRING);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));
    setTimeout(() => {
      channel.close();
      conn.close();
    }, 500);
    resolve();
  });
}

async function consumeMessage(queue, callback) {
  const conn = await amqp.connect(CONNECT_STRING);
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, callback, { noAck: true });
}

module.exports = { publishMessage, consumeMessage };