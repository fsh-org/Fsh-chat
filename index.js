process.env = require('./env.js');

// Packages
const express = require('express');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT ?? 8080;

const mid = ()=>Math.floor(Math.random()*Math.pow(16,12)).toString(16).padStart(12, '0');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(bodyParser.raw({
  limit: '100mb'
}));
app.use(bodyParser.json({
  limit: '100mb'
}));

// Folders
app.use('/images', express.static('images'));
app.use('/', express.static('public'));

// Apis
let tenorCache = {};
app.get('/tenor', async function(req, res) {
  let q = req.query['q'];
  if (tenorCache[q]) {
    if (tenorCache[q].time>Date.now()) {
      res.json(tenorCache[q].data);
      return;
    }
  }
  let data = await fetch(`https://tenor.googleapis.com/v2/search?key=${process.env['tenor']}&country=US&locale=US-en&limit=50&media_filter=gif&q=${q}`);
  data = await data.json();
  tenorCache[q] = {
    time: Date.now()+(24*60*60*1000), // 24 Hours
    data
  };
  res.json(data);
});

// Chat api websockets
const wss = new WebSocketServer({ noServer: true });

let users = [];
function sendUser(stream, type, data) {
  data = JSON.stringify(data);
  if (type==='ws') {
    stream.send(data);
  } else if (type==='sse') {
    stream.write(`event: message\ndata: ${data}\n\n`);
  }
}
function sendInRoom(room, data) {
  users.forEach(user=>{
    if (room!=='*'&&user.room!==room) return;
    if (data.type==='message') {
      data.data.time = new Date().getTime();
      data.data.mid = mid();
      data.data.id = crypto.createHash('sha256').update(data.data.id).digest('hex');
    }
    sendUser(user.stream, user.type, data);
  });
}

function newUser(stream, type) {
  let id = mid();

  users.push({ id, stream, type, room: 'main' });
  sendUser(stream, type, { type: 'welcome', data: id });
  sendInRoom('main', {
    type: 'message',
    auth: 'server',
    data: {
      id: '',
      name: 'Server',
      color: '888888',
      content: `${id} joined main`,
      files: []
    }
  });
  sendInRoom('*', { type: 'stats', data: users.length });

  return id;
}
function leaveUser(id) {
  let user = users.find(user=>user.id===id);
  sendInRoom(user.room, {
    type: 'message',
    auth: 'server',
    data: {
      id: '',
      name: 'Server',
      color: '888888',
      content: `${id} left`,
      files: []
    }
  });
  users = users.filter(user=>user.id!==id);
  sendInRoom('*', { type: 'stats', data: users.length });
}

function handleMessage(data, id) {
  let user = users.find(user=>user.id===id);
  switch (data.type) {
    case 'message':
      // If empty leave
      if (!data.data.content.trim() && !data.data.files.length) return;
      // Send to all on same room
      sendInRoom(user.room, {
        type: 'message',
        auth: 'user',
        data: {
          id,
          name: data.data.name || 'Anonymous',
          color: data.data.color,
          content: data.data.content,
          files: data.data.files || []
        }
      });
      if (data.data.content.toLowerCase().includes('fsh')) {
        sendInRoom(user.room, {
          type: 'message',
          auth: 'bot',
          data: {
            id: '',
            name: 'Fsh',
            color: '888888',
            content: 'fsh',
            files: []
          }
        });
      }
      break;
    case 'room':
      let lastroom = user.room;
      users = users.map(user=>{
        if (user.id!==id) return user;
        user.room = data.data.room.replaceAll(/ |,|\./gi,'-').replaceAll(/[^a-zA-Z0-9_\-]/g,'');
        return user;
      });
      user = users.find(user=>user.id===id);
      sendInRoom(lastroom, {
        type: 'message',
        auth: 'server',
        data: {
          id: '',
          name: 'Server',
          color: '888888',
          content: `${id} left ${lastroom}`,
          files: []
        }
      });
      sendInRoom(user.room, {
        type: 'message',
        auth: 'server',
        data: {
          id: '',
          name: 'Server',
          color: '888888',
          content: `${id} joined ${user.room}`,
          files: []
        }
      });
      break;
  }
}

wss.on('connection', (ws)=>{
  let id = newUser(ws, 'ws');

  ws.on('message', (raw)=>{
    let data = JSON.parse(raw);
    handleMessage(data, id);
  });

  ws.on('close', ()=>{
    leaveUser(id);
  });
});

// Pass the websockets
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Chat api sse
app.get('/sse', async function(req, res) {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let id = newUser(res, 'sse');

  let heartBeat = setInterval(()=>{
    res.write(`: Heartbeat\n\n`);
  }, 30 * 1000); // 30 Seconds

  res.on('close', () => {
    clearInterval(heartBeat);
    leaveUser(id);
    res.end();
  });
});

app.post('/sse', async function(req, res) {
  if (!req.body || (typeof req.body!=='object') || !req.body.id) {
    res.status(400);
    res.json({ err: true, msg: 'Invalid body' });
    return;
  }
  let id = req.body.id;
  handleMessage(req.body, id);
});

// 404
app.use(function(req, res) {
  res.status(404);
  res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Listen
server.listen(port, ()=>{
  console.log(`Listening on port ${port}`);
});