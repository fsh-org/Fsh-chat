let GS = document.getElementById('gifSearch');
let GR = document.getElementById('gifResult');
let GP = document.getElementById('gifPicker');
function gifOpen() {
  GP.open ? GP.close() : GP.show()
}
var GT;

GS.onkeyup = function () {
  clearTimeout(GT);
  GT = setTimeout(GSF, 500);
};
GS.onkeydown = function () {
  clearTimeout(GT);
};

let GLa = "";
function GSF () {
  if (GLa == GS.value) return;
  GLa = GS.value;
  GR.style.height = '0';
  if (GS.value.length>0) {
    fetch('./tenor?q='+GS.value).then(async res => {
      res = await res.json()
      res = res.results;
      res = res.map(e=>{return `<img class="gif" src="${e.media_formats.gif.url}" alt="${e.content_description}" onclick="AtachementFiles.push('${e.media_formats.gif.url}');UFP()">`})
      GR.innerHTML = '<br><br>'+res.join("");
      GR.style.height = '65vh';
    })
  } else {
    GR.innerHTML = ""
  }
}