// Name save
document.getElementById("name").addEventListener("keyup", () => {
  localStorage.setItem("name", document.getElementById("name").value);
});
document.getElementById("name").value = localStorage.getItem("name");

// Color save
document.getElementById("color").addEventListener("input", () => {
  localStorage.setItem("color", document.getElementById("color").value);
});
document.getElementById("color").value = localStorage.getItem("color") ?? '#8888ff';

function disclose() {
  document.getElementById('disclose').showModal();
}