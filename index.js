const debugMode = process.env.NOVAMPP_DEBUG === '1';
const forceDocker = process.env.NOVAMPP_FORCE_DOCKER === '1';
const forceMenu = process.env.NOVAMPP_FORCE_MENU === '1';
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const literalpath = path.join(__dirname);
const fs = require('fs');
const axios = require('axios');
async function checkforupdates() {
    const appVersion = app.getVersion();
    const otherVersionUrl = 'https://git.zeusteam.dev/nova/novampp/-/raw/master/package.json';
    try {
        const response = await axios.get(otherVersionUrl);
        const otherVersion = response.data.version;

        if (appVersion === otherVersion) {
            console.log('App version is up to date');
        } else if (appVersion < otherVersion) {
            console.log('App version is older');
            dialog.showMessageBox({
                type: 'info',
                title: 'Update Available - NovAMPP',
                message: 'A new version of NovAMPP is available. Please update to the latest version.',
                detail: `Current Version: ${appVersion}\nLatest Version: ${otherVersion}`,
                buttons: ['OK', 'Update']
            }).then((response) => {
                if (response.response === 1) {
                    const command = process.platform === 'win32' ? 'start https://git.zeusteam.dev/nova/novampp/-/releases' : process.platform === 'darwin' ? 'open https://git.zeusteam.dev/nova/novampp/-/releases' : 'xdg-open https://git.zeusteam.dev/nova/novampp/-/releases';
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.log('Failed to open update page');
                        } else {
                            console.log('Update page opened');
                        }
                    });
                } else {
                    console.log('User chose not to update');
                };
            });
        } else {
            console.log('I have no idea what happened here');
        }
    } catch (error) {
        console.log('Failed to fetch latest version');
    }
};
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
    console.log('Debug logging is enabled');
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
    if (forceMenu) {
        console.log('Forcing menu page');
        win.loadFile(path.join(__dirname, './src/menu.html'));
    } else if (forceDocker) {
        console.log('Forcing Docker start page');
        win.loadFile(path.join(__dirname, './src/startdocker.html'));
    } else if (isDockerRunning()) {
        win.loadFile(path.join(__dirname, './src/menu.html'));
    } else {
        win.loadFile(path.join(__dirname, './src/index.html'));
    };
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
        { label: 'Restart Compose', click: () => {
            exec('docker compose down && docker compose up -d', { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    console.log('Failed to restart Compose');
                } else {
                    console.log('Compose restarted');
                };
            });
        }},
        { type: 'separator' },
        { label: 'Quit', click: () => {
            app.exit();
            app.quit();
        }},
    ]);
    trayIcon.setContextMenu(trayMenu);
};
app.whenReady().then(() => {
    console.log('Starting NovAMPP...');
    checkforupdates();
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
ipcMain.handle('isdockerrunning', async (event) => {
    const dockerRunning = await isDockerRunning();
    if (dockerRunning) {
        console.log('Docker is running');
        return new Promise((resolve, reject) => {
            resolve('running');
        });
    } else {
        console.log('Docker is not running');
        return new Promise((resolve, reject) => {
            resolve('notrunning');
        });
    };
});
ipcMain.handle('install-docker', (event) => {
    console.log('Installing Docker...');
    const command = process.platform === 'win32' ? 'start https://docs.docker.com/docker-for-windows/install/' : process.platform === 'darwin' ? 'open https://docs.docker.com/docker-for-mac/install/' : 'xdg-open https://docs.docker.com/engine/install/';
    console.log(command);
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log('Failed to open Docker installation page');
                resolve('failed');
            } else {
                console.log('Docker installation page opened');
                resolve('success');
            }
        });
    });
});
ipcMain.handle('start-docker', (event) => {
    const dockerRunning = isDockerRunning();
    if (dockerRunning) {
        console.log('Docker is already running');
        return new Promise((resolve, reject) => {
            resolve('running');
        });
    } else {
        console.log('Starting Docker...');
        const command = process.platform === 'win32' ? 'start docker' : process.platform === 'darwin' ? 'open --background -a Docker' : 'systemctl start docker';
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log('Failed to start Docker');
                    resolve('failed');
                } else {
                    console.log('Docker started');
                    resolve('started');
                }
            });
        });
    };
});
app.on('window-all-closed', function () {
    app.exit();
    app.quit();
});