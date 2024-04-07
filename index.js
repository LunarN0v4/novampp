const debugMode = process.env.NOVAMPP_DEBUG === '1';
const forceDocker = process.env.NOVAMPP_FORCE_DOCKER === '1';
const forceMenu = process.env.NOVAMPP_FORCE_MENU === '1';
const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
const axios = require('axios');
const fs = require('fs');
const iconPath = path.join(__dirname, './src/main/favicon.png');
const installdocker = require('./scripts/installdocker');
const { isDockerInstalled, registeripc } = require('./scripts/ipc');
const unzipper = require('unzipper');
function startupchecks() {
    if (!fs.existsSync(literalpath)) fs.mkdirSync(literalpath);
    if (!fs.existsSync(literalpath + '/docker')) fs.mkdirSync(literalpath + '/docker');
    const dockerComposePath = path.join(literalpath, '/docker/docker-compose.yaml');
    if (!fs.existsSync(dockerComposePath)) {
        const zipUrl = 'https://git.zeusteam.dev/nova/novampp/-/releases/latest/download/docker.zip';
        const zipFilePath = path.join(literalpath, '/docker/docker.zip');
        const extractPath = path.join(literalpath, '/docker');
        axios({
            method: 'get',
            url: zipUrl,
            responseType: 'stream'
        }).then(response => {
            const writer = fs.createWriteStream(zipFilePath);
            response.data.pipe(writer);
            writer.on('finish', () => {
                fs.createReadStream(zipFilePath)
                    .pipe(unzipper.Extract({ path: extractPath }))
                    .on('close', () => {
                        fs.unlinkSync(zipFilePath);
                        console.log('Compose files extracted successfully');
                        app.dialog.showMessageBox(null, {
                            type: 'info',
                            title: 'Compose - NovAMPP',
                            message: 'Where would you like to get the Compose images from?',
                            detail: 'GitLab - Recommended, faster (takes ~1-2 mins), may not have the latest packages.\nSelf-build - Not recommended, slower (takes ~10-30 mins), will have the latest packages.',
                            buttons: ['GitLab', 'Self-build']
                        }).then((response) => {
                            if (response.response === 0) {
                                fs.unlinkSync(literalpath + '/docker/docker-compose.yaml');
                                fs.rmdirSync(literalpath + '/docker/builds/', { recursive: true });
                                fs.renameSync(literalpath + '/docker/docker-compose-gitlab.yaml', literalpath + '/docker/docker-compose.yaml');
                                exec('docker compose up -d', { cwd: literalpath + "/docker/" }, (error, stdout, stderr) => {
                                    if (error) {
                                        console.log('Failed to start Compose');
                                    } else {
                                        console.log('Compose started');
                                    };
                                });
                            } else if (response.response === 1) {
                                fs.unlinkSync(literalpath + '/docker/docker-compose-gitlab.yaml');
                                exec('docker compose up -d', { cwd: literalpath + "/docker/" }, (error, stdout, stderr) => {
                                    if (error) {
                                        console.log('Failed to start Compose');
                                    } else {
                                        console.log('Compose started');
                                    };
                                });
                            } else {
                                console.log('User cancelled the dialog');
                            };
                        });
                    });
            });
        }).catch(error => {
            console.log('Failed to download the Compose files');
        });
    };
    if (fs.existsSync(path.join(literalpath, '/docker/docker.zip'))) {
        fs.unlinkSync(path.join(literalpath, '/docker/docker.zip'));
        console.log('docker.zip deleted');
    };
    if (fs.existsSync(path.join(literalpath, '/docker/docker-installer.exe'))) {
        fs.unlinkSync(path.join(literalpath, '/docker/docker-installer.exe'));
        console.log('docker-installer.exe deleted');
    };
    if (fs.existsSync(path.join(literalpath, '/docker/docker.dmg'))) {
        fs.unlinkSync(path.join(literalpath, '/docker/docker.dmg'));
        console.log('docker.dmg deleted');
    };
    if (fs.existsSync(path.join(literalpath, '/docker/docker-installer.deb'))) {
        fs.unlinkSync(path.join(literalpath, '/docker/docker-installer.deb'));
        console.log('docker-installer.deb deleted');
    };
    if (fs.existsSync(path.join(literalpath, '/docker/docker-installer.rpm'))) {
        fs.unlinkSync(path.join(literalpath, '/docker/docker-installer.rpm'));
        console.log('docker-installer.rpm deleted');
    };
    if (!fs.existsSync(literalpath + '/docker/data')) {
        fs.mkdirSync(literalpath + '/docker/data');
    } else if (!fs.existsSync(literalpath + '/docker/data/httpd')) {
        fs.mkdirSync(literalpath + '/docker/data/httpd');
    } else if (!fs.existsSync(literalpath + '/docker/data/mysql')) {
        fs.mkdirSync(literalpath + '/docker/data/mysql');
    } else if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/conf-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/conf-enabled');
    } else if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/mods-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/mods-enabled');
    } else if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/sites-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/sites-enabled');
    };
    if (fs.existsSync(path.join(literalpath, '/docker/data/phpmyadmin.inc.php'))) {
        fs.chmodSync(path.join(literalpath, '/docker/data/phpmyadmin.inc.php'), 0o600);
    };
};
function checkargs() {
    if (process.argv.length === 2) {
        switch (process.argv[1]) {
            case '--squirrel-install':
                if (process.platform === 'win32') {
                    const shortcutPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'NovAMPP.lnk');
                    const targetPath = process.execPath;
                    exec(`powershell "$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut('${shortcutPath}'); $shortcut.TargetPath = '${targetPath}'; $shortcut.Save()"`);
                };
                break;
            case '--squirrel-updated':
                if (process.platform === 'win32') {
                    const shortcutPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'NovAMPP.lnk');
                    const targetPath = process.execPath;
                    exec(`powershell "$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut('${shortcutPath}'); $shortcut.TargetPath = '${targetPath}'; $shortcut.Save()"`);
                };
                break;
            case '--squirrel-uninstall':
                if (process.platform === 'win32') {
                    const shortcutPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'NovAMPP.lnk');
                    exec(`powershell "Remove-Item -Path '${shortcutPath}'"`);
                };
                break;
            case '--squirrel-obsolete':
                if (process.platform === 'win32') {
                    const shortcutPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'NovAMPP.lnk');
                    exec(`powershell "Remove-Item -Path '${shortcutPath}'"`);
                };
                break;
            case '--terminal':
                if (global.ConsoleOpen === undefined) {
                    global.ConsoleOpen = true;
                    app.whenReady().then(() => {
                        const newWindow = new BrowserWindow({
                            width: 900,
                            height: 600,
                            resizable: false,
                            webPreferences: {
                                preload: path.join(__dirname, './src/preload.js'),
                                nodeIntegration: true,
                                contextIsolation: true,
                            }
                        });

                        newWindow.loadFile(path.join(__dirname, './src/main/console.html'));
                        newWindow.setMenuBarVisibility(false);
                        newWindow.setIcon(path.join(iconPath));
                        const originalConsoleLog = console.log;

                        console.log = function (...args) {
                            const logMessage = args.join(' ');
                            newWindow.webContents.send('console-message', logMessage);
                            originalConsoleLog.apply(console, args);
                        };
                    });
                };
        }
    };
    if (debugMode && global.ConsoleOpen === undefined) {
        global.ConsoleOpen = true;
        app.whenReady().then(() => {
            const newWindow = new BrowserWindow({
                width: 900,
                height: 600,
                resizable: false,
                webPreferences: {
                    preload: path.join(__dirname, './src/preload.js'),
                    nodeIntegration: true,
                    contextIsolation: true,
                }
            });
    
            newWindow.loadFile(path.join(__dirname, './src/main/console.html'));
            newWindow.setMenuBarVisibility(false);
            newWindow.setIcon(path.join(iconPath));
            const originalConsoleLog = console.log;
    
            console.log = function (...args) {
                const logMessage = args.join(' ');
                newWindow.webContents.send('console-message', logMessage);
                originalConsoleLog.apply(console, args);
            };
        });
    };
};
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
                buttons: ['Don\'t Update', 'Update']
            }).then((response) => {
                if (response.response === 1) {
                    const command = process.platform === 'win32' ? 'start https://git.zeusteam.dev/nova/novampp/-/releases' : process.platform === 'darwin' ? 'open https://git.zeusteam.dev/nova/novampp/-/releases' : 'xdg-open https://git.zeusteam.dev/nova/novampp/-/releases';
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.log('Failed to open update page');
                        } else {
                            console.log('Update page opened');
                            app.exit();
                            app.quit();
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
//if (debugMode) {
//    function createLogger(logFilePath) {
//        const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
//    
//        const originalConsoleLog = console.log;
//    
//        console.log = function (...args) {
//            const logMessage = args.join(' ');
//            logStream.write(`${logMessage}\n`);
//            originalConsoleLog.apply(console, args);
//        };
//    
//        return {
//            close: function () {
//                logStream.end();
//            }
//        };
//    };
//    function log() {
//        if (!fs.existsSync(path.join(__dirname, './logs'))) {
//            fs.mkdirSync(path.join(__dirname, './logs'));
//        }
//        const logFilePath = path.join(__dirname, `./logs/`, `${Date.now()}.log`);
//        const logger = createLogger(logFilePath);
//        return logger;
//    };
//    log();
//    console.log('Debug logging is enabled');
//};

function createWindow() {
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
    isDockerInstalled().then((dockerinstalled) => {
        if (forceMenu) {
            console.log('Forcing menu page');
            win.loadFile(path.join(__dirname, './src/menu/menu.html'));
        } else if (forceDocker) {
            console.log('Forcing Docker install page');
            win.loadFile(path.join(__dirname, './src/setup/installdocker.html'));
        } else if (dockerinstalled === "true") {
            win.loadFile(path.join(__dirname, './src/menu/menu.html'));
        } else {
            win.loadFile(path.join(__dirname, './src/setup/installdocker.html'));
        };
    }).catch((error) => {
        console.log('Failed to check if Docker is installed');
    });
    //win.webContents.openDevTools();
    return win;
};

function createTrayMenu(win) {
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
            exec('docker compose down && docker compose up -d', { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
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

app.whenReady().then(async () => {
    await checkargs();
    await registeripc();
    console.log('Starting NovAMPP...');
    startupchecks();
    installdocker();
    checkforupdates();
    const win = createWindow();
    createTrayMenu(win);
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    app.on('browser-window-created', function (event, window) {
        window.setIcon(iconPath);
    });
});

app.on('window-all-closed', function () {
    app.exit();
    app.quit();
});