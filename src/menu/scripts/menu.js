const errormessage = document.getElementById('errormessage');
const restartcompose = document.getElementById('restartcompose');
const resetcompose = document.getElementById('resetcompose');
const stopcompose = document.getElementById('stopcompose');
const startcompose = document.getElementById('startcompose');
const whatdoesthisdo = document.getElementById('whatdoesthisdo');
const opendata = document.getElementById('opendata');
const advanced = document.getElementById('advanced');

window.onload = async function() {
    errormessage.style.color = 'white';
    errormessage.innerText = 'Checking if NovAMPP Compose is running, please wait...';
    const composeresponse = await window.electronAPI.iscomposerunning();
    if (composeresponse === 'running') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'NovAMPP Compose is running';
    } else {
        errormessage.style.color = 'white';
        errormessage.innerText = 'NovAMPP Compose is not running, please wait...';
        const startresponse = await window.electronAPI.startcompose();
        if (startresponse === 'success') {
            errormessage.style.color = 'green';
            errormessage.innerText = 'NovAMPP Compose is running';
        } else if (startresponse === 'fail') {
            errormessage.style.color = 'red';
            errormessage.innerText = 'Failed to start NovAMPP Compose, run with "--terminal" for more information';
        };
    };
};

restartcompose.addEventListener('click', async () => {
    errormessage.style.color = 'white';
    errormessage.innerText = 'Restarting NovAMPP Compose, please wait...';
    const response = await window.electronAPI.restartcompose();
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'NovAMPP Compose has been restarted';
    } else if (response === 'fail') {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to restart NovAMPP Compose, run with "--terminal" for more information';
    }
});

resetcompose.addEventListener('click', async () => {
    errormessage.style.color = 'white';
    errormessage.innerText = 'Resetting NovAMPP Compose, please wait...';
    const response = await window.electronAPI.resetcompose();
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'NovAMPP Compose has been reset';
    } else if (response === 'fail') {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to reset NovAMPP Compose, run with "--terminal" for more information';
    }
});

stopcompose.addEventListener('click', async () => {
    errormessage.style.color = 'white';
    errormessage.innerText = 'Stopping NovAMPP Compose, please wait...';
    const response = await window.electronAPI.stopcompose();
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'NovAMPP Compose has been stopped';
    } else if (response === 'fail') {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to stop NovAMPP Compose, run with "--terminal" for more information';
    }
});

startcompose.addEventListener('click', async () => {
    errormessage.style.color = 'white';
    errormessage.innerText = 'Starting NovAMPP Compose, please wait...';
    const response = await window.electronAPI.startcompose();
    if (response === 'success') {
        errormessage.style.color = 'green';
        errormessage.innerText = 'NovAMPP Compose has been started';
    } else if (response === 'fail') {
        errormessage.style.color = 'red';
        errormessage.innerText = 'Failed to start NovAMPP Compose, run with "--terminal" for more information';
    }
});

whatdoesthisdo.addEventListener('click', async () => {
    await window.electronAPI.whatdoesthisdo();
});

opendata.addEventListener('click', async () => {
    await window.electronAPI.opendata();
});

advanced.addEventListener('click', async () => {
    await window.electronAPI.advanced();
});