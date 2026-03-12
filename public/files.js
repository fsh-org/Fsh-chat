// Data
const typeOpen = {
  image: 'img',
  video: 'video',
  audio: 'audio'
}
const typeClose = {
  image: '',
  video: '</video>',
  audio: '</audio>'
}
const typeIcons = {
  image: 'image',
  video: 'video',
  audio: 'audio'
}

// Utility functions
function DataToElem(data) {
  if (data.startsWith('https://')) return `<img src="${data}" class="FOPImg">`;
  return `<${typeOpen[data.replace('data:','').split('/')[0]]??'div'} src="${data}" class="FOPImg" controls loading="lazy" draggable="false">${typeClose[data.replace('data:','').split('/')[0]]??'</div>'}`;
}

// Update File Preview
function UFP() {
  document.getElementById('preview').innerHTML = AtachementFiles.map(file=>`<div class="FileOnPreview">
<button class="FOPDelete" onclick="AtachementFiles.splice(AtachementFiles.indexOf(this.parentElement.children[1].src),1);this.parentElement.remove()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" style="fill:var(--red-1)"><path d="M42.6776 7.32227C32.9145 -2.44063 17.0852 -2.44077 7.32214 7.32227C-2.44082 17.0853 -2.44069 32.9146 7.32214 42.6777L92.2616 127.617L7.32214 212.557C-2.44091 222.32 -2.44083 238.149 7.32214 247.912C17.0852 257.675 32.9145 257.675 42.6776 247.912L127.617 162.973L212.557 247.912C222.32 257.675 238.149 257.675 247.912 247.912C257.675 238.149 257.675 222.32 247.912 212.557L162.973 127.617L247.912 42.6777C257.675 32.9146 257.675 17.0853 247.912 7.32227C238.149 -2.44079 222.32 -2.44068 212.557 7.32227L127.617 92.2617L42.6776 7.32227Z"/></svg></button>
${DataToElem(file)}
</div>`).join('');
}

let AtachementFiles = [];

// Adding files
let fel = document.getElementById('files');
fel.onchange = function(){
  Array.from(fel.files).forEach(file=>{
    // Read file
    let data = new FileReader();
    data.readAsDataURL(file);
    data.addEventListener('loadend', ()=>{
      if (!typeOpen[file.type.split('/')[0]]) {
        alert(`Unsuported file type ${file.type}`);
      }
      AtachementFiles.push(data.result);
      UFP();
    })
  });
  fel.value = '';
}

// Pasting files
window.addEventListener('paste', (evt) => {
  fel.files = evt.clipboardData.files;
  fel.onchange();
});

// Zoom
function zoomAtachment(evt) {
  document.getElementById('zoomDialog').showModal();
  document.querySelector('#zoomDialog .in').innerHTML = evt.target.outerHTML;
}