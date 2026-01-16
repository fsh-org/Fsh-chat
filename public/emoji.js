let picker = document.getElementById('emojiPicker');
let mess = document.getElementById('message');
let tempCursorPos = 0, emojiData;
picker.style.display = 'none';

picker.customEmoji = [
  {
    name: 'Fsh',
    shortcodes: ['fsh'],
    url: './images/fsh.png'
  },
  {
    name: 'Fsh Spin',
    shortcodes: ['fshspin', 'fsh spin'],
    url: './images/fsh.gif'
  },
  {
    name: 'Trol',
    shortcodes: ['trol'],
    url: './images/troll.png'
  },
  {
    name: 'Cat Nod',
    shortcodes: ['catnod', 'cat nod'],
    url: './images/catnod.gif'
  },
  {
    name: 'Cat No',
    shortcodes: ['catno', 'cat no'],
    url: './images/catno.gif'
  },
  {
    name: 'Shook',
    shortcodes: ['shook'],
    url: './images/shook.png'
  },
  {
    name: 'Thumbs up',
    shortcodes: ['thumbsup', 'thumbs up'],
    url: './images/thumbsup.png'
  },
  {
    name: 'Real Gun',
    shortcodes: ['realgun', 'real gun', 'rgun','rg'],
    url: './images/gun.png'
  }
];

fetch('https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1/en/emojibase/data.json')
  .then(res=>res.json())
  .then(res=>{
    emojiData = res.concat(picker.customEmoji);
    window.emojiShort = {};
    emojiData.forEach(emoji=>{
      emoji.shortcodes.forEach(sc=>window.emojiShort[sc]=emoji.url??emoji.emoji);
      if(emoji.tags) emoji.tags.forEach(tag=>{if(!window.emojiShort[tag]&&Number.isNaN(Number(tag)))window.emojiShort[tag]=emoji.emoji});
    });
  });

function pickmoji() {
  picker.style.display=picker.style.display===''?'none':'';
};
function insertAtCursor(myValue) {
  mess.value = mess.value.substring(0, tempCursorPos)
    + myValue
    + ' '
    + mess.value.substring(tempCursorPos, mess.value.length);
  tempCursorPos += myValue.length+1;
}

// Save pos
mess.addEventListener('keyup', (evt)=>{
  tempCursorPos = evt.target.selectionStart;
});
mess.addEventListener('mouseup', (evt)=>{
  tempCursorPos = evt.target.selectionStart;
});

picker.addEventListener('emoji-click', (event)=>{
  insertAtCursor(event.detail.emoji.url?`:${event.detail.name}:`:event.detail.unicode);
});