let socket = io(window.location.origin, {
  path: "/socket.io"
});

function send() {
  if (document.getElementById('message').value == "!help") {
    showMessage({
      type: 'message',
      auth: 'bot',
      data: {
        name: 'Server (Client)',
        color: '888',
        content: 'Commands: help, clear',
        time: new Date().getTime(),
        files: []
      }
    })
    return;
  }
  if (document.getElementById('message').value == "!clear") {
    document.getElementById("msg").innerHTML = `<i>Cleared chat</i><br>`;
    return;
  }
  ['igg','agg'].forEach(b => {
    if (document.getElementById('message').value.toLowerCase().includes(b)) {
      showMessage({
        type: 'message',
        auth: 'bot',
        data: {
          name: 'Server (Client)',
          color: '888',
          content: 'Please refrain from using that language',
          time: new Date().getTime(),
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
      files: (AtachementFiles||[]).filter(e => {return e != ''})||[]
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
  if (auth == 'server') {
    if (((txt.match(/[a-zA-Z0-9\-\_]{20} joined/)||[])[0] || '').length) {
      if (txt.startsWith(socket.id)) txt = txt.replace(/[a-zA-Z0-9\-\_]{20} joined/, '<b>You</b> joined')
    }
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
      .replaceAll(/^[*-_]{3,}$/gm, function(match){
        return '<hr>'
      })
      // Code (multiple line)
      .replaceAll(/(?<!\\)```.+?\n[^¬]+?\n(?<!\\)```/g, function(match){
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
        let ttt = match.replaceAll(/\[|\]/g,"").split(":")
        ttt[0] = ttt[0].slice(0,6).replaceAll(/[^0-9a-fA-F]/g,'')
        return '<label style="color:#'+ttt[0]+'">'+ttt[1]+'</label>'
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
        ext: ".svg"
      });
}

let last;
function showMessage(data) {
  let time = new Date(data.data.time);
  let final = (data.auth != 'user' || last != data.data.id ? `<b style="color:#${data.data.color}">${data.auth == 'server' ? '<i class="fa-solid fa-user-shield"></i> ' : data.auth == 'bot' ? '<i class="fa-solid fa-robot"></i> ' : ''}${data.data.name} <time>${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}</time></b><br>` : '')+`
${Markdown(data.data.content, data.auth)}
${data.data.files.length ? '<br>' : ''}
${data.data.files.map(file => DataToElem(file)).join('')}
<br>`

  last = data.data.id;
  document.getElementById("msg").insertAdjacentHTML("beforeend", final);
}

socket.on("data", (data) => {
  console.log(data)
  switch (data.type) {
    case 'stats':
      document.getElementById("Co").innerHTML=`<i class="fa-solid fa-user"></i> ${data.data.count}`
      break;
    case 'message':
      showMessage(data)
      document.getElementById("msg").scrollTop = document.getElementById("msg").scrollHeight;
      if (!document.hasFocus()) {
        let ping = new Audio('./ping.mp3')
        ping.play()
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
      content: 'You have been disconnected ('+reason+')',
      time: new Date().getTime(),
      files: []
    }
  })
})

// Field resize
var map = {};
document.getElementById("message").onkeydown = document.getElementById("message").onkeyup = function(e){
  e = e || event;
  map[e.keyCode] = e.type == 'keydown';
  if (map[13] && !map[16]) {
    send()
    e.preventDefault();
  }
  document.getElementById("message").attributes.rows.value = Math.min(Math.max(document.getElementById("message").value.split("\n").length, 1), 6);
}

// Rooms
document.querySelectorAll('.roomSide button').forEach(bb => {
  bb.onclick = function(){
    let rum = bb.innerHTML.toLowerCase();
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
})