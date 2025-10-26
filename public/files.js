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

// Update File Preview
function UFP() {
  document.getElementById("preview").innerHTML = AtachementFiles.map(file=>`<div class="FileOnPreview">
<button class="FOPDelete" onclick="AtachementFiles[AtachementFiles.indexOf(this.parentElement.children[2].src)]='';this.parentElement.remove()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" style="fill:var(--red-1)"><path d="M77.0892 18.9306C79.4013 18.9306 81.5077 17.6021 82.5038 15.5156L88.281 3.41493C89.2771 1.32846 91.3835 0 93.6956 0H162.304C164.617 0 166.723 1.32847 167.719 3.41494L173.496 15.5156C174.492 17.6021 176.599 18.9306 178.911 18.9306H222C226.418 18.9306 230 22.5123 230 26.9306V39C230 43.4183 226.418 47 222 47H34C29.5817 47 26 43.4183 26 39V26.9306C26 22.5123 29.5817 18.9306 34 18.9306H77.0892Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M42.4949 62.0605C39.7335 62.0605 37.4949 64.2991 37.4949 67.0605V241C37.4949 249.284 44.2106 256 52.4949 256H203.505C211.789 256 218.505 249.284 218.505 241V67.0605C218.505 64.2991 216.266 62.0605 213.505 62.0605H42.4949ZM78.8686 87.9194C71.728 87.9194 65.9393 93.708 65.9393 100.849V215.919C65.9393 223.06 71.728 228.849 78.8686 228.849C86.0093 228.849 91.7979 223.06 91.7979 215.919V100.849C91.7979 93.708 86.0093 87.9194 78.8686 87.9194ZM128 87.9194C120.859 87.9194 115.071 93.708 115.071 100.849V215.919C115.071 223.06 120.859 228.849 128 228.849C135.141 228.849 140.929 223.06 140.929 215.919V100.849C140.929 93.708 135.141 87.9194 128 87.9194ZM164.202 100.849C164.202 93.708 169.991 87.9194 177.131 87.9194C184.272 87.9194 190.061 93.708 190.061 100.849V215.919C190.061 223.06 184.272 228.849 177.131 228.849C169.991 228.849 164.202 223.06 164.202 215.919V100.849Z"/></svg></button>
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