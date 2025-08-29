// MDParse, Copyright Fsh-org
window.MDParse = function(text, custom=(t)=>{return t}) {
  // Reserve
  let reserve = {};
  function reservemd(txt) {
    let id = Math.floor(Math.random()*Math.pow(10, 16)).toString(10).padStart(16, '0');
    reserve[id] = txt;
    return `¬r${id}¬r`;
  }
  // Basic escaping
  text = text
    .replaceAll('<', '~lt;')
    .replaceAll('"', '~quot;');
  // Elements that need reserve
  text = text
    .replaceAll(/```([^¬]|¬)*?```/g, function(match){
      match = match
        .replaceAll('&', '&amp;')
        .replaceAll('~lt;', '&lt;')
        .replaceAll('~quot;', '&quot;');
      return reservemd(`<code class="block">${match.slice(3,-3)}</code>`);
    })
    .replaceAll(/\[(.+?)\]\((~lt;https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)>|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\)/g, function(match,g1,g2){
      if (match.match(/^~lt;.+?>$/m)) match=match.slice(4,-1);
      return reservemd(`<a href="${g2}">${g1}</a>`);
    })
    .replaceAll(/(~lt;https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)>|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g, function(match){
      if (match.match(/^~lt;.+?>$/m)) match=match.slice(4,-1);
      return reservemd(`<a href="${match}">${match}</a>`);
    });
// More escaping
  text = text
    .replaceAll('&', '&amp;')
    .replaceAll('~lt;', '&lt;')
    .replaceAll('~quot;', '&quot;')
    .replaceAll("'", '&apos;');
  // General
  text = text
    .replaceAll(/\`.+?\`/g, function(match){return '<code>'+reservemd(match.slice(1,-1))+'</code>'}) // Inline code
    .replaceAll(/\*\*.+?\*\*/g, function(match){return '<b>'+match.slice(2,-2)+'</b>'}) // Bold
    .replaceAll(/\*.+?\*/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'}) // Italic 1
    .replaceAll(/\_\_.+?\_\_/g, function(match){return '<u>'+match.slice(2,-2)+'</u>'}) // Underline
    .replaceAll(/\_.+?\_/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'}) // Italic 2
    .replaceAll(/\~\~.+?\~\~/g, function(match){return '<s>'+match.slice(2,-2)+'</s>'}) // Strikethrough
    .replaceAll(/\=\=.+?\=\=/g, function(match){return '<mark>'+match.slice(2,-2)+'</mark>'}) // Highlight
    .replaceAll(/\~.+?\~/g, function(match){return '<sub>'+match.slice(1,-1)+'</sub>'}) // Subscript
    .replaceAll(/\^.+?\^/g, function(match){return '<sup>'+match.slice(1,-1)+'</sup>'}) // Superscript
    .replaceAll(/^\> .+?$/gm, function(match){return '<blockquote>'+match.slice(2)+'</blockquote>'}) // Blockquote
    .replaceAll(/^(-|\*) .+?$/gm, function(match){return '<li>'+match.slice(2)+'</li>'}) // List
    .replaceAll(/^### .+?$/gm, function(match){return '<span style="font-size:110%">'+match.slice(4)+'</span>'}) // 3rd heading
    .replaceAll(/^## .+?$/gm, function(match){return '<span style="font-size:125%">'+match.slice(3)+'</span>'}) // 2nd heading
    .replaceAll(/^# .+?$/gm, function(match){return '<span style="font-size:150%">'+match.slice(2)+'</span>'}); // 1st heading

  text = custom(text);

  // Reserve
  text = text.replaceAll(/¬r[0-9]{16}¬r/g, function(match){
    let id = match.split('¬r')[1];
    if (reserve[id]) {
      return reserve[id];
    } else {
      return match;
    }
  })
  // Return
  return text;
}