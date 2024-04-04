const installdocker = document.getElementById('installdocker');
const errormessage = document.getElementById('errormessage');

installdocker.addEventListener('click', async () => {
    const response = await window.electronAPI.installdocker();
    console.log(response);
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'Docker has been successfully installed';
    } else {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to install Docker';
    }
});