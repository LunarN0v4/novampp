const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    isdockerrunning: () => ipcRenderer.invoke('isdockerrunning'),
    startdocker: () => ipcRenderer.invoke('start-docker'),
    installdocker: () => ipcRenderer.invoke('install-docker'),
});