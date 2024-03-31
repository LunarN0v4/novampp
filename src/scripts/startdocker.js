const dockerstart = document.getElementById('dockerstart');
const installdocker = document.getElementById('installdocker');
const errormessage = document.getElementById('errormessage');
window.addEventListener('load', async () => {
    const response = await window.electronAPI.isdockerrunning();
    if (response === 'running') {
        window.location.href = 'menu.html';
    };
});
dockerstart.addEventListener('click', async () => {
    const response = await window.electronAPI.startdocker();
    if (response === 'started') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'Docker started successfully, redirecting to the menu page...';
        window.location.href = 'menu.html';
    } else if (response === 'running') {
        window.location.href = 'menu.html';
    } else {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Docker failed to start. Are you sure Docker is installed?';
    }
});

installdocker.addEventListener('click', async () => {
    const response = await window.electronAPI.installdocker();
    console.log(response);
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'Docker installation page opened';
    } else {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to open Docker installation page';
    }
});