let socket = io(window.location.origin, {
  path: "/socket.io"
});

function send() {
  let message = document.getElementById('message').value;
  if (message === "!help") {
    showMessage({
      type: 'message',
      auth: 'bot',
      data: {
        name: 'Server (Client)',
        color: '888',
        content: 'Commands: help, clear, fsh',
        time: new Date().getTime(),
        files: []
      }
    })
    return;
  }
  if (message === "!clear") {
    last = '';
    document.getElementById("msg").innerHTML = `<i>Cleared chat</i><br>`;
    return;
  }
  if (message === "!fsh") {
    document.body.insertAdjacentHTML("beforeend", `<style>body{background:url('https://fsh.plus/fsh.gif')}</style>`);
    return;
  }
  ['igg','agg'].forEach(b => {
    if (message.toLowerCase().includes(b)) {
      showMessage({
        type: 'message',
        auth: 'bot',
        data: {
          name: 'Server (Client)',
          color: '888',
          content: 'Please refrain from using that language',
          time: Date.now(),
          files: []
        }
      })
      return;
    }
  })
  socket.emit('data', {
    type: 'message',
    auth: 'user',
    data: {
      name: document.getElementById('name').value,
      color: document.getElementById('color').value.replace('#',''),
      content: document.getElementById('message').value.replaceAll("\n","\\n"),
      files: (AtachementFiles??[]).filter(e=>e.length>0)??[]
    }
  });
  AtachementFiles = [];
  fel.value = '';
  document.getElementById("preview").innerHTML = '';
  document.getElementById('message').value = '';
  document.getElementById("message").attributes.rows.value = 1;
}

function Markdown(txt, auth) {
  if (auth != 'server') {
    let ch = {
      '&': '&amp;',
      "<": '&lt;',
      ">": '&gt;'
    }
    Object.keys(ch).forEach(th => {
      txt = txt.replaceAll(th, ch[th])
    })
  }
  if (auth === 'server') {
    if (txt.startsWith(socket.id) && txt.match(/[a-zA-Z0-9\-\_]{20} joined/)) txt = txt.replace(/[a-zA-Z0-9\-\_]{20} joined/, '<b>You</b> joined');
    return txt;
  }
  return twemoji.parse(
    txt
      // New line
      .replaceAll('\\n','\n')
      // Bold
      .replaceAll(/(?<!\\)\*\*.+?(?<!\\)\*\*/g, function(match) {
        return "<b>"+match.replaceAll("**","")+"</b>"
      })
  		// Italics
      .replaceAll(/(?<!\\)\*.+?(?<!\\)\*/g, function(match) {
        return "<i>"+match.replaceAll("*","")+"</i>"
      })
      // Underline
      .replaceAll(/(?<!\\)__.+?(?<!\\)__/g, function(match) {
        return "<u>"+match.replaceAll("__","")+"</u>"
      })
      // Italics 2
      .replaceAll(/(?<!\\)_.+?(?<!\\)_/g, function(match) {
        return "<i>"+match.replaceAll("_","")+"</i>"
      })
      // Strike through
      .replaceAll(/(?<!\\)~~.+?(?<!\\)~~/g, function(match) {
        return "<s>"+match.replaceAll("~~","")+"</s>"
      })
      // Supscript
      .replaceAll(/(?<!\\)\^.+?(?<!\\)\^/g, function(match) {
        return "<sup>"+match.replaceAll("^","")+"</sup>"
      })
      // Subscript
      .replaceAll(/(?<!\\)~.+?(?<!\\)~/g, function(match) {
        return "<sub>"+match.replaceAll("~","")+"</sub>"
      })
      // Blockquote
      .replaceAll(/(?<!.)&gt; .+/g, function(match) {
        return "<label class=\"MDbq\">"+match.replace("&gt; ","")+"</label>"
      })
      // Headings
      .replaceAll(/^#{1,3} (.*?)$/gm, function(match, g1) {
        return `<h${match.split(' ')[0].split("#").length-1} class="MDhd">${g1}</h${match.split(' ')[0].split("#").length-1}>`
      })
      // Hotizontal rule
      .replaceAll(/^[\*\-\_]{3,}$/gm, function(match){
        return '<hr>'
      })
      // Code (multiple line)
      .replaceAll(/(?<!\\)```.+?\n([^¬]|¬)+?\n(?<!\\)```/g, function(match){
        return '<pre><code class="MDcode">'+match.split('\n').slice(1, match.split('\n').length-1).join('\n')+'</pre></code>'
      })
      // Code (one line)
      .replaceAll(/(?<!\\)`.+?(?<!\\)`/g, function(match){
        return '<pre><code class="MDcode">'+match.replaceAll('`','')+'</pre></code>'
      })
      // High light
      .replaceAll(/(?<!\\)==.+?(?<!\\)==/g, function(match){
        return '<mark>'+match.replaceAll('==','')+'</mark>'
      })
      // Colored text
      .replaceAll(/(?<!\\)\[.+?:.+?(?<!\\)\]/g, function(match) {
        let ttt = match.replaceAll(/\[|\]/g,"").split(":");
        ttt[0] = ttt[0].replaceAll(/[^0-9a-fA-F]/g,'').slice(0,6);
        return `<label style="color:#${ttt[0]}">${ttt.slice(1).join(':')}</label>`;
      })
      // New line
      .replaceAll('\n','<br>')
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
        	return `<img class="emoji" src="${realEmoji}"/>`;
  			} else {
  				return realEmoji
  			}
  		}), {
        size: "svg",
        ext: ".svg",
        base: 'https://raw.githubusercontent.com/twitter/twemoji/refs/heads/master/assets/'
      });
}

const userIcons = {
  server: '<i class="fa-solid fa-user-shield"></i>',
  bot: '<i class="fa-solid fa-robot"></i>',
  user: ''
};
var last = '';
function showMessage(data) {
  let time = new Date(data.data.time);
  document.getElementById("msg").insertAdjacentHTML("afterbegin", `<div id="m-${data.data.id}">
  ${(data.auth!=='user' || last!==data.data.id)?`<b style="color:#${data.data.color}">
    ${userIcons[data.auth]??''} ${data.data.name} <time>${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}</time>
  </b>`:''}
  <span>${Markdown(data.data.content, data.auth)}</span>
  ${data.data.files.length?`<div>${data.data.files.map(file => DataToElem(file)).join('')}</div>`:''}
</div>`);
  last = data.data.id;
  Array.from(document.querySelectorAll('img.FOPImg')).forEach(attach=>attach.onclick = zoomAtachment);
}

let ping = new Audio('./ping.mp3');
socket.on("data", (data) => {
  console.log(data);
  switch (data.type) {
    case 'stats':
      document.getElementById("Co").innerText = data.data.count;
      break;
    case 'message':
      showMessage(data);
      if (!document.hasFocus()) {
        ping.play();
      }
      break;
  }
})

socket.on("disconnect", (reason) => {
  showMessage({
    type: 'message',
    auth: 'bot',
    data: {
      name: 'Server (Client)',
      color: '888',
      content: `You have been disconnected (${reason})`,
      time: new Date().getTime(),
      files: []
    }
  })
})

// Send / New line
var map = {};
document.getElementById("message").onkeydown = document.getElementById("message").onkeyup = function(e){
  map[e.keyCode] = e.type == 'keydown';
  if (map[13] && !map[16]) {
    send();
    e.preventDefault();
  }
}
// Field resize
document.getElementById("message").oninput = function(event){
  event.target.setAttribute('rows', Math.min(Math.max(event.target.value.split('\n').length, 1), 6));
};

// Rooms
document.querySelectorAll('.roomSide > button').forEach(roombutton => {
  roombutton.onclick = function(){
    let rum = roombutton.innerHTML.toLowerCase();
    if (rum == 'custom') rum = prompt('Room id')
    document.getElementById("msg").innerHTML = '';
    socket.emit('data', {
      type: 'room',
      auth: 'user',
      data: {
        room: rum
      }
    });
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