process.env = require('./env.js');

const express = require('express')
const app = express();
var path = require('path');
const server = require('http').createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  maxHttpBufferSize: 1e9, // 1 gb
  pingInterval: 20000, // 20s
  pingTimeout: 10000 // 10s
})

const port = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/images', express.static('images'))
app.use('/', express.static('public'))

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
})

app.use(function(req, res) {
  res.status(404);
  res.sendFile(path.join(__dirname, 'public', 'error.html'));
})

function mid() {
  return Math.floor(Math.random()*Math.pow(10,16)).toString(16).padStart(14, '0');
}

io.of('/').adapter.on('join-room', (room, id) => {
  io.to(room).emit('data', {
    type: 'message',
    auth: 'server',
    data: {
      id: '',
      name: 'Server',
      color: '888888',
      content: `${id} joined ${room}`,
      files: [],
      time: new Date().getTime(),
      mid: mid()
    }
  });
});
io.of('/').adapter.on('leave-room', (room, id) => {
  io.to(room).emit('data', {
    type: 'message',
    auth: 'server',
    data: {
      id: '',
      name: 'Server',
      color: '888888',
      content: `${id} left ${room}`,
      files: [],
      time: new Date().getTime(),
      mid: mid()
    }
  });
});

io.on('connection', (socket) => {
  socket.leave(socket.id)
  socket.join('main')
  io.emit('data', {
    type: 'stats',
    auth: 'server',
    data: {
      count: io.engine.clientsCount
    }
  })

  function rome() {
    return Array.from(io.sockets.adapter.sids.get(socket.id))[0];
  }

  socket.on('data', async(data) => {
    switch (data.type) {
      case 'message':
        // If empty leave
        if (!data.data.content.trim() && !data.data.files.length) return;
        // Send to all on same room
        io.to(rome()).emit('data', {
          type: 'message',
          auth: 'user',
          data: {
            id: socket.id,
            name: data.data.name || 'Anonymous',
            color: data.data.color,
            content: data.data.content,
            files: data.data.files || [],
            time: new Date().getTime(),
            mid: mid()
          }
        })
        if (data.data.content.toLowerCase().includes('fsh')) {
          io.to(rome()).emit('data', {
            type: 'message',
            auth: 'bot',
            data: {
              id: '',
              name: 'Fsh',
              color: '888888',
              content: 'fsh',
              files: [],
              time: new Date().getTime(),
              mid: mid()
            }
          })
        }
        break;
      case 'room':
        io.sockets.adapter.sids.get(socket.id).forEach(k => socket.leave(k));
        socket.join(data.data.room);
        break;
    }
  });

  socket.on('disconnect', () => {
    io.emit('data', {
      type: 'stats',
      auth: 'server',
      data: {
        count: io.engine.clientsCount
      }
    })
    io.emit('data', {
      type: 'message',
      auth: 'server',
      data: {
        id: '',
        name: 'Server',
        color: '888888',
        content: `${socket.id} left`,
        files: [],
        time: new Date().getTime(),
        mid: mid()
      }
    });
  });
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});