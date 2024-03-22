function DataToElem(data) {
  return `<${data.includes("image/") ? "img" : data.includes("video/") ? "video controls" : data.includes("audio/") ? "audio controls" : "img"} src="${data}" class="FOPImg">${data.includes("image/") ? "" : data.includes("video/") ? "</video>" : data.includes("audio/") ? "</audio>" : ""}`
}

function ico(e) {
  let types = {
    image: 'image',
    video: 'video',
    audio: 'audio'
  }

  if (e.includes("tenor.com")) {
    return `<img width="50px" height="14px" src="/images/tenor.svg">`
  }

  if (String(types[e.split("/")[0].replace("data:",'')]) != 'undefined') {
    return `<i class="fa-solid fa-file-${types[e.split("/")[0].replace("data:",'')]}"></i>`
  } else {
    return `<i class="fa-solid fa-file-circle-question"></i>`
  }
}

// Update File Preview
function UFP() {
  let fil = "";
  AtachementFiles.forEach(e=>{
    fil += `<div class="FileOnPreview">
<button class="FOPDelete" onclick="AtachementFiles[AtachementFiles.indexOf(this.parentElement.children[1].src)]='';this.parentElement.remove()"><i class="fa-solid fa-trash" style="color: #ff0000;"></i></button>
<div class="FOPIcon">${ico(e)}</div>
${DataToElem(e)}
</div>`
  })
  document.getElementById("preview").innerHTML = fil;
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
    context.scale(newWidth/img.width,  newHeight/img.height);
    context.drawImage(img, 0, 0); 
    resolve(canvas.toDataURL());               
  }
});
}
function sizeBase64Img(base64) {
  return new Promise((resolve, reject)=>{
    let img = document.createElement("img");
    img.src = base64;
    img.onload = function () {
      resolve([img.width, img.height]);               
    }
  });
}

let AtachementFiles = [];

var fel = document.getElementById('files')
fel.onchange = function() {
  Array.from(fel.files).forEach(e => {
    let dat = new FileReader();
    dat.readAsDataURL(e);
    dat.addEventListener("loadend", async() => {
      let final = dat.result;
      if (e.type.includes('image/')) {
        let size = await sizeBase64Img(dat.result)
        let compress = await resizeBase64Img(dat.result, size[0]/2, size[1]/2)
        final = compress
        if (dat.result.length < final.length) {
          final = dat.result
        }
        if (e.type.includes("gif")) {
          final = dat.result
        }
      } else if (e.type.includes("video/") || e.type.includes("audio/")) {
        final = dat.result
      } else {
        alert('Unsuported file type ' + e.type)
      }
      AtachementFiles.push(final);
      UFP();
    })
  })
}