window.addEventListener('DOMContentLoaded', () => {
    const console = document.getElementById('output');
    console.innerHTML = 'Receiving logs from NovAMPP...<br>Starting NovAMPP...';
    window.electronAPI.consolelog();
});