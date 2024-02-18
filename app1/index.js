const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { publishMessage } = require("./message");
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));
app.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `example.com`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
});

const PORT = 3040;

io.on('connection', (socket) => {
  console.log('Um usuário conectou');

  socket.on('disconnect', () => {
    console.log('Usuário desconectou');
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs", { socketUrl: `http://127.0.0.1:${PORT}` });
});

app.post("/send", (req, res) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).send("Message is required");
  }
  const payload = {
    webhook_url: `http://app1:${PORT}/webhook`,
    body: { message },
  };
  publishMessage("mensagem", JSON.stringify(payload)).then(() => {
    res.send({ message: `Message received: ${message}` });
  }).catch((err) => {
    res.status(500).send({ message: `Error sending message: ${err.message}` });
  });
});

app.post("/webhook", (req, res) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).send("Message is required");
  }
  console.log(`Received encrypted message: ${message} at ${new Date().toISOString()}`);
  io.emit("message", { message });
  res.send({ success: true });
});

server.listen(PORT, () => {
  console.log(`Server is running on: http://127.0.0.1:${PORT}`);
});
