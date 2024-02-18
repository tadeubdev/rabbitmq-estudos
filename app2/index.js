const app = require("express")();
const amqp = require("amqplib");

const PORT = 3060;

const user = process.env.RABBITMQ_USER || 'user';
const password = process.env.RABBITMQ_PASSWORD || 'password';
const host = process.env.RABBITMQ_HOST || 'rabbitmq';
const CONNECT_STRING = `amqp://${user}:${password}@${host}`;

function encryptMessage(message) {
  return message.split("").reverse().join("");
}

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

consumeMessage("mensagem", async (data) => {
  const payload = data.content.toString();
  const { webhook_url, body } = JSON.parse(payload);
  const message = body.message;
  const date = new Date();
  console.log(`[${date.toISOString()}] Received message: ${message}`);
  const encryptedMessage = await encryptMessage(message);
  const webhookPayload = {
    message: encryptedMessage,
    webhook_url,
  };
  publishMessage("webhook", JSON.stringify(webhookPayload)).then(() => {
    console.log(`[${date.toISOString()}] Sent encrypted message: ${encryptedMessage}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on: http://127.0.0.1:${PORT}`);
});
