window.onload = async function() {
    const errormessage = document.getElementById('errormessage');
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
        } else {
            errormessage.style.color = 'red';
            errormessage.innerText = 'Failed to start NovAMPP Compose, run with "--terminal" for more information';
        };
    };
};