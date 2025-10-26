let socket;
let socketType;
let wsAttempts = 0;
let wsMaxAttempts = 4;
let sseHeartbeat;
const ping = new Audio('./ping.mp3');

function connect() {
  if (sseHeartbeat) clearInterval(sseHeartbeat);
  if (socket?.readyState > 1) socket.close();
  if (wsAttempts<wsMaxAttempts) {
    socketType = 'ws';
    socket = new WebSocket(window.location.origin+'/ws');
    socket.onclose = ()=>{
      wsAttempts += 1;
      showMessage({
        type: 'message',
        auth: 'bot',
        data: {
          id: '',
          name: 'Server (Client)',
          color: '808080',
          content: `You have been disconnected`,
          files: [],
          time: new Date().getTime(),
          mid: ''
        }
      });
      connect();
    };
  } else {
    socketType = 'sse';
    socket = new EventSource(window.location.origin+'/sse');
    sseHeartbeat = setInterval(()=>{
      if (socket?.readyState > 1) connect();
    }, 2 * 1000); // 2 Seconds
  }
  socket.onmessage = (msg) => {
    let data = JSON.parse(msg.data);
    console.log(data);
    switch (data.type) {
      case 'welcome':
        socket.id = data.data;
        break;
      case 'stats':
        document.getElementById('Co').innerText = data.data;
        break;
      case 'message':
        showMessage(data);
        if (!document.hasFocus()) ping.play();
        break;
    }
  };
}
connect();

const messageField = document.getElementById('message');
function send() {
  // Save and clear
  let message = messageField.value;
  messageField.value = '';
  messageField.oninput();
  // Commands
  if ((/^![a-z]+$/m).test(message)) {
    switch(message) {
      case '!help':
        showMessage({
          type: 'message',
          auth: 'bot',
          data: {
            id: '',
            name: 'Server (Client)',
            color: '888888',
            content: 'Commands: help, clear, fsh',
            files: [],
            time: new Date().getTime(),
            mid: ''
          }
        });
        return;
      case '!clear':
        last = '';
        document.getElementById('msg').innerHTML = `<i>Cleared chat</i><br>`;
        return;
      case '!fsh':
        document.body.insertAdjacentHTML('beforeend', `<style>body{background:url('https://fsh.plus/fsh.gif')}</style>`);
        return;
    }
  }
  // Profanity
  ['igg','agg'].forEach(b => {
    if (message.toLowerCase().includes(b)) {
      showMessage({
        type: 'message',
        auth: 'bot',
        data: {
          id: '',
          name: 'Server (Client)',
          color: '888888',
          content: 'Please refrain from using that language',
          files: [],
          time: Date.now(),
          mid: ''
        }
      });
      return;
    }
  });
  // Send to server
  let data = JSON.stringify({
    id: socket.id,
    type: 'message',
    data: {
      name: document.getElementById('name').value,
      color: document.getElementById('color').value.replace('#',''),
      content: message.replaceAll('\n','\\n'),
      files: (AtachementFiles??[]).filter(e=>e.length>0)??[]
    }
  });
  if (socketType==='ws') {
    socket.send(data);
  } else if (socketType==='sse') {
    fetch('/sse', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: data
    });
  }
  AtachementFiles = [];
  document.getElementById('preview').innerHTML = '';
}

function Markdown(txt) {
  return twemoji.parse(
    window.MDParse(txt.replaceAll('\\n','\n'))
      // Hotizontal rule
      .replaceAll(/^[\*\-\_]{3,}$/gm, function(match){
        return '<hr>'
      })
      // Colored text
      .replaceAll(/(?<!\\)\[.+?:.+?(?<!\\)\]/g, function(match) {
        let ttt = match.replaceAll(/\[|\]/g,"").split(":");
        ttt[0] = ttt[0].replaceAll(/[^0-9a-fA-F]/g,'').slice(0,6);
        return `<label style="color:#${ttt[0]}">${ttt.slice(1).join(':')}</label>`;
      })
  		// render custom emojis
  		.replaceAll(/:(.+?):/g, function(match) {
  			let thing = match.replace(/:/g,'').toLowerCase()
  			let realEmoji, type;
  			for(let emoj in picker.customEmoji){
  				for(let cusmoji in picker.customEmoji[emoj].shortcodes) {
  					if(thing == picker.customEmoji[emoj].shortcodes[cusmoji]) {
            	type = "custom";
            	realEmoji = picker.customEmoji[emoj].url;
  					};
  				};
  				for(let emoj in emojiData){
  					for(let cusmoji in emojiData[emoj].shortcodes) {
  						if(thing == emojiData[emoj].shortcodes[cusmoji]) {
  							type = "real";
  							realEmoji = emojiData[emoj].emoji;
  						};
  					};
  				};
  			};
  			if(!realEmoji) return match;
  			if(type == "custom") {
        	return `<img class="emoji" src="${realEmoji}" alt="emoji">`;
  			} else {
  				return realEmoji;
  			}
  		}), {
        size: "svg",
        ext: ".svg",
        base: 'https://raw.githubusercontent.com/twitter/twemoji/refs/heads/master/assets/'
      });
}

function styleMessageContent(txt, auth) {
  switch(auth) {
    case 'server':
      if (txt.startsWith(socket.id) && txt.match(/[a-zA-Z0-9]{12} joined/)) txt = txt.replace(/[a-zA-Z0-9]{12} joined/, '<b>You</b> joined');
      return txt;
    default:
      return Markdown(txt);
  }
}

const userIcons = {
  server: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill-rule="evenodd" clip-rule="evenodd" d="M97 135.001C43.3945 135.199 0 178.715 0 232.367V253C0 254.657 1.34314 256 3 256H97.3672V256H185.294C186.788 256 188 254.788 188 253.293C188 252.104 187.224 251.055 186.087 250.706L181.055 249.162C177.001 247.919 173.069 246.305 169.31 244.342C160.751 239.871 153.026 233.959 146.474 226.865L144.183 224.386C139.573 219.394 135.484 213.946 131.978 208.125L131 206.5L126 196L122.879 188.354C118.33 177.21 115.831 165.335 115.501 153.303L115.08 137.918C115.035 136.294 113.706 135 112.081 135H97.3672H97V135.001Z"></path><circle cx="116.5" cy="61.5" r="47.5"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M191.603 115.112C192.088 115.207 192.564 115.362 193.019 115.578L202.664 120.149L217.432 127.148L217.678 127.265L217.934 127.359L243.537 136.758V145.922C243.537 161.5 239.597 176.824 232.083 190.47L231.711 191.146C228.193 197.536 223.879 203.454 218.872 208.758L217.518 210.193C212.115 215.917 205.834 220.742 198.911 224.487L194.687 226.772C193.714 227.298 192.669 227.633 191.603 227.776V115.112ZM198.158 104.734C193.294 102.429 187.653 102.422 182.783 104.714L173.044 109.299L158.423 116.182L129.018 126.906C126.605 127.786 125 130.08 125 132.648V141.569C125 162.051 130.538 182.152 141.027 199.744L141.861 201.142C144.845 206.147 148.279 210.869 152.121 215.249L154.376 217.821C160.532 224.839 167.911 230.681 176.153 235.063L180.548 237.399C186.758 240.7 194.21 240.673 200.396 237.327L204.62 235.042C212.666 230.69 219.966 225.082 226.244 218.43L227.599 216.995C233.302 210.953 238.216 204.212 242.223 196.934L242.595 196.258C251.085 180.839 255.537 163.524 255.537 145.922V132.653C255.537 130.087 253.935 127.793 251.526 126.908L222.325 116.188L207.804 109.306L198.158 104.734Z"></path></svg>',
  bot: '<i class="fa-solid fa-robot"></i>',
  user: ''
};

var last = '';
function showMessage(data) {
  let time = new Date(data.data.time);
  document.getElementById('msg').insertAdjacentHTML('afterbegin', `<div id="m-${data.data.id}">
  ${(data.auth!=='user' || last!==data.data.id)?`<b style="color:#${data.data.color}">
    ${userIcons[data.auth]??''} ${data.data.name} <time>${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}</time>
  </b>`:''}
  <span>${styleMessageContent(data.data.content, data.auth)}</span>
  ${data.data.files.length?`<div>${data.data.files.map(file => DataToElem(file)).join('')}</div>`:''}
</div>`);
  last = data.data.id;
  Array.from(document.querySelectorAll('img.FOPImg')).forEach(attach=>attach.onclick = zoomAtachment);
}

// Field resize
messageField.oninput = function() {
  messageField.style.height = 'auto';
  messageField.style.height = Math.min(messageField.scrollHeight-10, 20 * 6) + 'px';
};
// Send / New line
messageField.onkeydown = messageField.onkeyup = function(evt){
  if (evt.key!=='Enter'||evt.shiftKey) return;
  evt.preventDefault();
  send();
}

// Rooms
document.querySelectorAll('.roomSide > button').forEach(roombutton => {
  roombutton.onclick = function(){
    let room = roombutton.innerHTML.toLowerCase();
    if (room == 'custom') room = prompt('Room id')
    document.getElementById('msg').innerHTML = '';
    socket.send(JSON.stringify({
      type: 'room',
      data: {
        room
      }
    }));
  }
});

// Side bar
function showSide() {
  document.querySelector('.roomSide').style.display = 'flex';
  setTimeout(()=>{
    document.querySelector('.roomSide').style.left = '0vw';
  }, 1)
}
function hideSide() {
  document.querySelector('.roomSide').style.left = '-100vw';
  setTimeout(()=>{
    document.querySelector('.roomSide').style.display = 'none';
  }, 250)
}