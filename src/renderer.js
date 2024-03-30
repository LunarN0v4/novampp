const dockerstart = document.getElementById('dockerstart');
dockerstart.addEventListener('click', () => {
  window.electronAPI.startdocker();
})