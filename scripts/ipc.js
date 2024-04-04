const { ipcMain } = require('electron');
function isDockerInstalled() {
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' ? 'docker version' : 'docker info';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve("false");
            } else {
                const command = process.platform === 'win32' ? 'docker-compose version' : 'docker-compose --version';
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log('Docker Compose is not installed');
                        resolve("compose");
                    } else {
                        console.log('Docker Compose is installed');
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
};
module.exports = registeripc;