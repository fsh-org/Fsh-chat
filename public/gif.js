// Elements
let GifSearch = document.getElementById('gifSearch');
let GifResult = document.getElementById('gifResult');
let GifPicker = document.getElementById('gifPicker');

// Open
function gifOpen() {
  GifPicker.open ? GifPicker.close() : GifPicker.show();
}

// Search after a bit of not writing
let GifTimeout;
GifSearch.onkeyup = function () {
  clearTimeout(GifTimeout);
  GifTimeout = setTimeout(GSF, 500);
};
GifSearch.onkeydown = function () {
  clearTimeout(GifTimeout);
};

let GifLast = '';
function GSF() {
  // If same, return
  if (GifLast == GifSearch.value) return;
  GifLast = GifSearch.value;

  // Hide results
  GifResult.style.height = '0';
  GifPicker.style.top = '';

  // If empty, remove inner
  if (GifSearch.value.length<1) {
    GifResult.innerHTML = '';
    return;
  }

  // Search
  fetch('./tenor?q='+GifSearch.value)
    .then(res=>res.json())
    .then(res=>{
      GifResult.innerHTML = res.results.map(e=>`<img class="gif" src="${e.media_formats.gif.url}" alt="${e.content_description}" onclick="AtachementFiles.push('${e.media_formats.gif.url}');UFP()">`).join('');
      GifResult.style.height = '65vh';
      GifPicker.style.top = 'calc(-60px - 65vh)';
    })
}