let picker = document.getElementById('emojiPicker');
let mess = document.getElementById('message');
let tempCursorPos = 0, emojiData;
picker.style.display = "none";

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
    name: 'Gun',
    shortcodes: ['gun'],
    url: './images/gun.png'
  }
];

(async()=>{
  let res = await fetch("https://cdn.jsdelivr.net/npm/emoji-picker-element-data@%5E1/en/emojibase/data.json");
  emojiData = await res.json();
})()

function pickmoji() {
  if (picker.style.display == "") {
    picker.style.display = "none";
  } else {
    picker.style.display = "";
  }
};
function insertAtCursor(myField, myValue) {
  myField.value = myField.value.substring(0, tempCursorPos)
    + myValue
    + ' '
    + myField.value.substring(tempCursorPos, myField.value.length);
  tempCursorPos += myValue.length+1
}

//save pos
/* On key */
mess.addEventListener('keyup', e => {
  tempCursorPos = e.target.selectionStart
});
/* On click */
mess.addEventListener('mouseup', e => {
  tempCursorPos = e.target.selectionStart
})

picker.addEventListener('emoji-click', event => {
  if('url' in event.detail.emoji){
    insertAtCursor(mess, `:${event.detail.emoji.name}:`)
  } else {
    insertAtCursor(mess, event.detail.emoji.unicode)
  }
});