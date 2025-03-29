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

function resizeBase64Img(base64, newWidth, newHeight) {
return new Promise((resolve, reject)=>{
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  let context = canvas.getContext("2d");
  let img = document.createElement("img");
  img.src = base64;
  img.onload = function () {
    context.scale(newWidth/img.width, newHeight/img.height);
    context.drawImage(img, 0, 0);
    resolve(canvas.toDataURL());
  }
});
}
function sizeBase64Img(base64) {
  return new Promise((resolve, reject)=>{
    let img = document.createElement("img");
    img.src = base64;
    img.onload = function(){
      resolve([img.width, img.height]);
    }
  });
}

let AtachementFiles = [];

// Adding files
let fel = document.getElementById('files')
fel.onchange = function(){
  Array.from(fel.files).forEach(file=>{
    // Read file
    let dat = new FileReader();
    dat.readAsDataURL(file);
    dat.addEventListener("loadend", async() => {
      let final = dat.result;
      if ((file.type.includes('image/') && file.type.includes("gif")) || file.type.includes("video/") || file.type.includes("audio/")) {
        // Normal, ignore
      } else if (file.type.includes('image/')) {
        // Images, try to compress
        let size = await sizeBase64Img(dat.result)
        let compress = await resizeBase64Img(dat.result, size[0]/2, size[1]/2)
        // Is size smaller?
        if (dat.result.length > compress.length) {
          final = compress;
        }
      } else {
        alert(`Unsuported file type ${file.type}`);
      }
      AtachementFiles.push(final);
      UFP();
    })
  });
  fel.value = '';
}