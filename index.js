const debugMode = process.env.NOVAMPP_DEBUG === '1';
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const literalpath = path.join(__dirname);
const fs = require('fs');
const exp = require('constants');
if (debugMode) {
    function createLogger(logFilePath) {
        const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
    
        const originalConsoleLog = console.log;
    
        console.log = function (...args) {
            const logMessage = args.join(' ');
            logStream.write(`${logMessage}\n`);
            originalConsoleLog.apply(console, args);
        };
    
        return {
            close: function () {
                logStream.end();
            }
        };
    };
    function log() {
        if (!fs.existsSync(path.join(__dirname, './logs'))) {
            fs.mkdirSync(path.join(__dirname, './logs'));
        }
        const logFilePath = path.join(__dirname, `./logs/`, `${Date.now()}.log`);
        const logger = createLogger(logFilePath);
        return logger;
    };
    log();
    console.log('Debug mode is enabled');
    console.log('Starting NovAMPP...');
};
function isDockerRunning() {
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' ? 'docker version' : 'docker info';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};
function createWindow() {
    const iconPath = path.join(__dirname, './src/favicon.png');
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './src/preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        }
    });
    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });
    win.setIcon(iconPath);
    win.loadFile('./src/index.html');
    //win.webContents.openDevTools();
    return win;
};
function createTrayMenu(win) {
    const iconPath = path.join(__dirname, './src/favicon.png');
    const trayIcon = new Tray(iconPath);
    const trayMenu = Menu.buildFromTemplate([
        { label: 'NovAMPP Manager', enabled: false },
        { label: 'Show / Hide', click: () => {
            if (win) {
                if (win.isVisible()) {
                    win.hide();
                } else {
                    win.show();
                }
            } else {
                createWindow();
            }
        }},
        { label: 'Item 2', click: () => console.log('Clicked Item 2') },
        { type: 'separator' },
        { label: 'Quit', click: () => {
            app.exit();
            app.quit();
        }},
    ]);
    trayIcon.setContextMenu(trayMenu);
};
app.whenReady().then(() => {
    const iconPath = path.join(__dirname, './src/favicon.png');
    const win = createWindow();
    createTrayMenu(win);
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    app.on('browser-window-created', function (event, window) {
        window.setIcon(iconPath);
    });
});
ipcMain.on('start-docker', (event) => {
    const dockerRunning = isDockerRunning();
    if (dockerRunning) {
        console.log('Docker is already running');
        return;
    } else {
        console.log('Starting Docker...');
        const command = process.platform === 'win32' ? 'start docker' : process.platform === 'darwin' ? 'open --background -a Docker' : 'systemctl start docker';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log('Failed to start Docker');
            } else {
                console.log('Docker started');
            }
        });
    }
});
app.on('window-all-closed', function () {
    app.exit();
    app.quit();
});