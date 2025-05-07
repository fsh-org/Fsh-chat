process.env = require('env.js');

const express = require('express')
const app = express();
var path = require('path');
const server = require('http').createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  maxHttpBufferSize: 1e10 // 10 gb
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
  let data = await fetch(`https://tenor.googleapis.com/v2/search?key=${process.env['tenor']}&country=US&locale=US-en&limit=25&media_filter=gif&q=${q}`);
  data = await data.json();
  tenorCache[q] = {
    time: Date.now()+(24*60*60*1000), // 24 Hours
    data
  };
  res.json(data);
})

app.use(function(req, res) {
  res.status(404);
  res.sendFile(path.join(__dirname, 'error.html'))
})

io.of("/").adapter.on("join-room", (room, id) => {
  io.to(room).emit('data', {
    type: 'message',
    auth: 'server',
    data: {
      content: `${id} joined ${room}`,
      name: 'Server',
      color: '888',
      files: [],
      time: new Date().getTime()
    }
  });
});
io.of("/").adapter.on("leave-room", (room, id) => {
  io.to(room).emit('data', {
    type: 'message',
    auth: 'server',
    data: {
      content: `${id} left ${room}`,
      name: 'Server',
      color: '888',
      files: [],
      time: new Date().getTime()
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
    return Array.from(io.sockets.adapter.sids.get(socket.id))[0]
  }
  
  socket.on('data', async(data) => {
    switch (data.type) {
      case 'message':
        if (!data.data.content.replaceAll(/ |\\n/g, "") && !data.data.files.length) return;
        io.to(rome()).emit('data', {
          type: 'message',
          auth: 'user',
          data: {
            content: data.data.content,
            name: data.data.name || 'Anonymous',
            color: data.data.color,
            id: socket.id,
            files: data.data.files || [],
            time: new Date().getTime()
          }
        })
        if (data.data.content.toLowerCase().includes('fsh')) {
          io.to(rome()).emit('data', {
            type: 'message',
            auth: 'bot',
            data: {
              content: 'fsh',
              name: 'Fsh',
              color: '888',
              files: [],
              time: new Date().getTime()
            }
          })
        }
        break;
      case 'room':
        io.sockets.adapter.sids.get(socket.id).forEach(k => socket.leave(k))
        socket.join(data.data.room)
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
        content: `${socket.id} left`,
        name: 'Server',
        color: '888',
        files: [],
        time: new Date().getTime()
      }
    });
  });
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});