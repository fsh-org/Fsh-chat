// Name save
document.getElementById("name").addEventListener("keyup", (event) => {
  localStorage.setItem("name", document.getElementById("name").value);
});
document.getElementById("name").value = localStorage.getItem("name");

// Color save
document.getElementById("color").addEventListener("input", (event) => {
  localStorage.setItem("color", document.getElementById("color").value);
});
document.getElementById("color").value = localStorage.getItem("color") || '#8888ff';