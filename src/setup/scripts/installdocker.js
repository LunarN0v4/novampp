const installdocker = document.getElementById('installdocker');
const subtext = document.getElementById('subtext');
const errormessage = document.getElementById('errormessage');

async function checkplatform() {
    await window.electronAPI.platform().then((response) => {
        console.log(response);
        if (response === 'win32') {
            installwsl.style.display = 'none';
            subtext.innerText = 'NovAMPP requires Docker Desktop to be installed';
        };
    });
};

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