const amqp = require("amqplib");
const axios = require("axios");
const bQueue = require("bee-queue");

const webhookQueue = new bQueue("webhook", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

const api = axios.create({
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

const CONNECT_STRING = "amqp://user:password@rabbitmq";

let conn;
let channel;

async function consumeMessage(queue, callback) {
  if (!conn) {
    conn = await amqp.connect(CONNECT_STRING);
    channel = await conn.createChannel();
  }
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, callback, { noAck: false });
}

consumeMessage("webhook", async (data) => {
  const mensagem = data.content.toString();
  const payload = JSON.parse(mensagem);
  await webhookQueue.createJob({ message: payload.message, url: payload.webhook_url, data }).save();
});

webhookQueue.process(async (job) => {
  try {
    const { url, message } = job.data;
    const response = await api.post(url, { message });
    // Passe uma representação serializável da resposta, como status e dados
    channel.ack(job.data.data);
    return { status: response.status, data: response.data };
  } catch (error) {
    // Passe uma representação serializável do erro
    channel.nack(job.data.data);
    return { error: error.message };
  }
});