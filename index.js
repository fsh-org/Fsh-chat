// Ignore for now, not using
/*const pantry = require('./pantry.js')
const pantryClient = new pantry(process.env["Pantry-DB"]);

// only basket rn is "chat"
pantryClient.details().then(console.log)*/

const express = require('express')
const app = express();
const server = require('http').createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  maxHttpBufferSize: 1e8 // 100 mb
})
// changed server create a little to increase file size limit

const port = process.env.PORT || 8080;

const bodyParser = require('body-parser');
const cors = require('cors');
var path = require('path');

const darken = require('./darkenColor.js')


//app.use(cors());
/*
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());*/

function genColor (sed) {
  let seed = "";
  sed.split().forEach(a => {
    seed = seed + a.charCodeAt(0)
  })
  seed = Number(seed)
  color = Math.floor((Math.abs(Math.sin(seed) * 16777215)));
  color = color.toString(16);
  // pad any colors shorter than 6 characters with leading 0s
  while(color.length < 6) {
    color = '0' + color;
  }

  return color;
}

app.use('/images', express.static('images'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname, 'style.css'))
});

io.on('connection', (socket) => {
  io.emit("message", {
    content: `<b style="color:#${genColor(socket.id)}">${(socket.handshake.query.username != '') ? `${socket.handshake.query.username}</b> <b style="color:${darken(-0.4, `#${genColor(socket.id)}`, false, true)}">(${socket.id})` : socket.id}</b> has connected`,
    username: "Server",
    auth: "server",
    color: "888",
    userCount: io.engine.clientsCount,
    files: [],
    time: new Date().getTime()
  });

  // On message
  // When send "message" to sever
  socket.on('message', async(data) => {
    // handle message here
    let data2 = data;
    
    if (!data2.content.replaceAll(/ |\\n/g, "") && !data2.files.length) return;

    data2["time"] = new Date().getTime();
    data2["color"] = genColor(socket.id)
    if (!data2.files) {
      data2.files = [];
    }
    data2["auth"] = "user";
    data2["userCount"] = io.engine.clientsCount;
    
    // Send "message" to all clients
    io.emit("message", data);
  });

  socket.on('disconnect', () => {
    io.emit("message", {
      content: `<b style="color:#${genColor(socket.id)}">${(socket.handshake.query.username != '') ? `${socket.handshake.query.username}</b> <b style="color:${darken(-0.4, `#${genColor(socket.id)}`, false, true)}">(${socket.id})` : socket.id}</b> has disconnected`,
      username: "Server",
      auth: "server",
      color: "888",
      files: [],
      userCount: io.engine.clientsCount,
      time: new Date().getTime()
    });
  });
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});