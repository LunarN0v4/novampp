const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    consolelog: () => ipcRenderer.on('console-message', (event, logMessage) => {
        const consoleElement = document.getElementById('output');
        const currentContent = consoleElement.innerHTML;
        consoleElement.innerHTML = `${currentContent}<br>${logMessage}`;
    }),
    iscomposerunning: () => ipcRenderer.invoke('iscomposerunning'),
    startcompose: () => ipcRenderer.invoke('start-compose'),
    isdockerinstalled: () => ipcRenderer.invoke('isdockerinstalled'),
    startdocker: () => ipcRenderer.invoke('start-docker'),
    installdocker: () => ipcRenderer.invoke('install-docker'),
});