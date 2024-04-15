const { ipcMain, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const iconPath = path.join(__dirname, './../src/main/favicon.png');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
function isDockerInstalled() {
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' ? 'docker version' : 'docker info';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve("false");
            } else {
                const command = process.platform === 'win32' ? 'docker compose version' : 'docker compose --version';
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log('Docker Compose is not installed');
                        resolve("compose");
                    } else {
                        console.log('Docker and Compose are installed');
                        resolve("true");
                    }
                });
            }
        });
    });
};
function registeripc() {
    ipcMain.handle('isdockerinstalled', async (event) => {
        const dockerInstalled = await isDockerInstalled();
        if (dockerInstalled === 'true') {
            console.log('Docker is installed');
            return new Promise((resolve, reject) => {
                resolve('installed');
            });
        } else if (dockerInstalled === 'compose') {
            console.log('Docker Compose is not installed');
            return new Promise((resolve, reject) => {
                resolve('compose');
            });
        } else {
            console.log('Docker is not installed');
            return new Promise((resolve, reject) => {
                resolve('notinstalled');
            });
        };
    });
    ipcMain.handle('iscomposerunning', async (event) => {
        const command = 'docker-compose ps';
        exec(command, { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
            if (error) {
                console.log('Error checking Docker Compose instances:', error);
                return new Promise((resolve, reject) => {
                    resolve('fail');
                });
            } else {
                const output = stdout.trim();
                if (output.includes('Up')) {
                    console.log('Docker Compose instances are running');
                    return new Promise((resolve, reject) => {
                        resolve('running');
                    });
                } else {
                    console.log('Docker Compose instances are not running');
                    return new Promise((resolve, reject) => {
                        resolve('notrunning');
                    });
                }
            }
        });
    });
    ipcMain.handle('start-compose', async (event) => {
        const command = 'docker compose up -d';
        exec(command, { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
            if (error) {
                console.log('Error starting Docker Compose:', error);
                return new Promise((resolve, reject) => {
                    resolve('fail');
                    
                });
            } else {
                console.log('Docker Compose started');
                return new Promise((resolve, reject) => {
                    resolve('success');
                    
                });
            }
        });
    });
    ipcMain.handle('restart-compose', async (event) => {
        const command = 'docker compose down && docker compose up -d';
        exec(command, { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
            if (error) {
                console.log('Error restarting Docker Compose:', error);
                return new Promise((resolve, reject) => {
                    resolve('fail');
                });
            } else {
                console.log('Docker Compose restarted');
                return new Promise((resolve, reject) => {
                    resolve('success');
                    
                });
            }
        });
    });
    ipcMain.handle('reset-compose', async (event) => {
        const command = 'docker compose down && docker rmi novampp-httpd && docker rmi novampp-mariadb && docker rmi novampp-phpmyadmin && docker compose up -d';
        exec(command, { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
            if (error) {
                console.log('Error resetting Docker Compose:', error);
                return new Promise((resolve, reject) => {
                    resolve('fail');
                    
                });
            } else {
                console.log('Docker Compose reset');
                return new Promise((resolve, reject) => {
                    resolve('success');
                    
                });
            }
        });
    });
    ipcMain.handle('stop-compose', async (event) => {
        const command = 'docker compose down';
        exec(command, { cwd: literalpath + "./docker/" }, (error, stdout, stderr) => {
            if (error) {
                console.log('Error stopping Docker Compose:', error);
                return new Promise((resolve, reject) => {
                    resolve('fail');
                    
                });
            } else {
                console.log('Docker Compose stopped');
                return new Promise((resolve, reject) => {
                    resolve('success');
                    
                });
            }
        });
    });
    ipcMain.handle('whatdoesthisdo', async (event) => {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.setIcon(iconPath);
        win.loadURL('./../src/menu/whatdoesthisdo.html');
    });
    ipcMain.handle('opendata', async (event) => {
        const command = process.platform === 'win32' ? 'start' : process.platform === 'linux' ? 'xdg-open' : 'open';
        const path = literalpath + '/docker/data/';
        exec(`${command} ${path}`);
    });
};
module.exports = { isDockerInstalled, registeripc };