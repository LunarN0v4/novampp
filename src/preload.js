const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    startdocker: () => ipcRenderer.send('start-docker'),
    installdocker: () => ipcRenderer.send('install-docker'),
});