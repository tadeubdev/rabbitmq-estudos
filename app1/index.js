const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { publishMessage, consumeMessage } = require("./message");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.json());

const PORT = 3040;

io.on('connection', (socket) => {
  console.log('Um usuário conectou');

  consumeMessage("mensagem_callback", (message) => {
    const result = message.content.toString();
    console.log(`Received encrypted message: ${result} at ${new Date().toISOString()}`);
    io.emit("message", { message: result });
  }, { noAck: true });

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
  publishMessage("mensagem", message).then(() => {
    res.send({ message: `Message received: ${message}` });
  }).catch((err) => {
    res.status(500).send({ message: `Error sending message: ${err.message}` });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on: http://127.0.0.1:${PORT}`);
});
