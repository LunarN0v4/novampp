const errormessage = document.getElementById('errormessage');
window.addEventListener('load', async () => {
    const response = await window.electronAPI.isdockerrunning();
    if (response === 'running') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'Docker is running, redirecting to the menu page...';
        window.location.href = 'menu.html';
    } else {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Docker is not running';
        window.location.href = 'startdocker.html';
    };
});