const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    consolelog: () => ipcRenderer.on('console-message', (event, logMessage) => {
        const consoleElement = document.getElementById('output');
        const currentContent = consoleElement.innerHTML;
        consoleElement.innerHTML = `${currentContent}<br>${logMessage}`;
    }),
    iscomposerunning: async () => await ipcRenderer.invoke('iscomposerunning'),
    startcompose: async () => await ipcRenderer.invoke('start-compose'),
    restartcompose: async () => await ipcRenderer.invoke('restart-compose'),
    resetcompose: async () => await ipcRenderer.invoke('reset-compose'),
    stopcompose: async () => await ipcRenderer.invoke('stop-compose'),
    opendata: async () => await ipcRenderer.invoke('opendata'),
    isdockerinstalled: async () => await ipcRenderer.invoke('isdockerinstalled'),
    installdocker: async () => await ipcRenderer.invoke('install-docker'),
    whatdoesthisdo: async () => await ipcRenderer.invoke('whatdoesthisdo'),
});