const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    isdockerinstalled: () => ipcRenderer.invoke('isdockerinstalled'),
    startdocker: () => ipcRenderer.invoke('start-docker'),
    installdocker: () => ipcRenderer.invoke('install-docker'),
});