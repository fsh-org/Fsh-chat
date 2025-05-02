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
  return `<${typeOpen[data.replace('data:','').split('/')[0]]??'div'} src="${data}" class="FOPImg" controls>${typeClose[data.replace('data:','').split('/')[0]]??'</div>'}`;
}
function ico(e) {
  if (e.includes("tenor.com")) return `<img width="50px" height="14px" src="/images/tenor.svg">`;

  if (String(typeIcons[e.split("/")[0].replace("data:",'')]) != 'undefined') {
    return `<i class="fa-solid fa-file-${typeIcons[e.split("/")[0].replace("data:",'')]}"></i>`;
  } else {
    return `<i class="fa-solid fa-file-circle-question"></i>`;
  }
}

// Update File Preview
function UFP() {
  document.getElementById("preview").innerHTML = AtachementFiles.map(file=>`<div class="FileOnPreview">
<button class="FOPDelete" onclick="AtachementFiles[AtachementFiles.indexOf(this.parentElement.children[2].src)]='';this.parentElement.remove()"><i class="fa-solid fa-trash" style="color:#ff0000"></i></button>
<div class="FOPIcon">${ico(file)}</div>
${DataToElem(file)}
</div>`).join('');
}

let AtachementFiles = [];

// Adding files
let fel = document.getElementById('files')
fel.onchange = function(){
  Array.from(fel.files).forEach(file=>{
    // Read file
    let data = new FileReader();
    data.readAsDataURL(file);
    data.addEventListener("loadend", ()=>{
      if (!typeOpen[file.type.split('/')[0]]) {
        alert(`Unsuported file type ${file.type}`);
      }
      AtachementFiles.push(data.result);
      UFP();
    })
  });
  fel.value = '';
}
