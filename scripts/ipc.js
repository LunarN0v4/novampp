const { ipcMain, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const createcompose = require('./dockercompose');
const installdocker = require('./installdocker');
const util = require('util');
const execPromisified = util.promisify(exec);
const iconPath = path.join(__dirname, './../src/main/favicon.png');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
async function isDockerInstalled() {
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' ? 'docker version' : 'docker info';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log('Docker Desktop is not installed');
                resolve(false);
            } else {
                const command = process.platform === 'win32' ? 'docker compose version' : 'docker compose --version';
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log('Docker Compose is not installed');
                        resolve('compose');
                    } else {
                        console.log('Docker and Compose are installed');
                        resolve(true);
                    }
                });
            }
        });
    });
};
function registeripc() {
    installdocker();
    ipcMain.handle('platform', async (event) => {
        return process.platform;
    });
    ipcMain.handle('isdockerinstalled', async (event) => {
        return await isDockerInstalled();
    });
    ipcMain.handle('iscomposerunning', async (event) => {
        const command = 'docker-compose ps';
        try {
            const { stdout, stderr } = await execPromisified(command, { cwd: literalpath + "./docker/" });
            if (stdout.includes('novampp_httpd') && stdout.includes('novampp_mariadb') && stdout.includes('novampp_phpmyadmin')) {
                console.log('Docker Compose is running');
                return 'running';
            } else {
                console.log('Docker Compose is not running');
                return 'notrunning';
            }
        } catch (error) {
            console.log('Error checking Docker Compose:', error);
            return 'fail';
        }
    });
    ipcMain.handle('start-compose', async (event) => {
        const command = 'docker compose up -d';
        try {
            await execPromisified(command, { cwd: literalpath + "./docker/" });
            console.log('Docker Compose started');
            return 'success';
        } catch (error) {
            console.log('Error starting Docker Compose:', error);
            return 'fail';
        }
    });
    ipcMain.handle('restart-compose', async (event) => {
        const command = 'docker compose down && docker compose up -d';
        try {
            await execPromisified(command, { cwd: literalpath + "./docker/" });
            console.log('Docker Compose restarted');
            return 'success';
        } catch (error) {
            console.log('Error restarting Docker Compose:', error);
            return 'fail';
        }
    });
    ipcMain.handle('reset-compose', async (event) => {
        const command = 'docker compose down && docker rmi novampp-httpd && docker rmi novampp-mariadb && docker rmi novampp-phpmyadmin && docker compose up -d';
        try {
            await execPromisified(command, { cwd: literalpath + "./docker/" });
            console.log('Docker Compose reset');
            return 'success';
        } catch (error) {
            console.log('Error resetting Docker Compose:', error);
            return 'fail';
        }
    });
    ipcMain.handle('stop-compose', async (event) => {
        const command = 'docker compose down';
        try {
            await execPromisified(command, { cwd: literalpath + "./docker/" });
            console.log('Docker Compose stopped');
            return 'success';
        } catch (error) {
            console.log('Error stopping Docker Compose:', error);
            return 'fail';
        }
    });
    ipcMain.handle('whatdoesthisdo', async (event) => {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.setIcon(iconPath);
        win.loadFile(path.join(__dirname, './../src/menu/whatdoesthisdo.html'));
    });
    ipcMain.handle('installwsl', async (event) => {
        const command = process.platform === 'win32' ? 'wsl --install' : process.platform === 'linux' ? 'echo "WSL already installed"' : 'echo "WSL not supported on macOS"';
        try {
            await execPromisified(command);
            console.log('WSL installed');
            return 'success';
        } catch (error) {
            console.log('Error installing WSL:', error);
            return 'fail';
        }
    });
    ipcMain.handle('opendockerinspage', async (event) => {
        const command = process.platform === 'win32' ? 'start' : process.platform === 'linux' ? 'xdg-open' : 'open';
        exec(`${command} https://docs.docker.com/get-docker/`);
    });
    ipcMain.handle('opendata', async (event) => {
        const command = process.platform === 'win32' ? 'start' : process.platform === 'linux' ? 'xdg-open' : 'open';
        const path = literalpath + '/docker/data/';
        exec(`${command} ${path}`);
    });
    ipcMain.handle('advanced', async (event) => {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.setIcon(iconPath);
        win.loadFile(path.join(__dirname, './../src/menu/advanced.html'));
    });
};
module.exports = { isDockerInstalled, registeripc };