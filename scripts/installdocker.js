const { ipcMain, dialog } = require('electron');
const axios = require('axios');
const sudo = require('sudo-prompt');
const fs = require('fs');
const path = require('path');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
const { execSync } = require('child_process');
function installdocker() {
    ipcMain.handle('install-docker', async (event) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Install Docker - NovAMPP',
            message: 'Docker is required to run NovAMPP, this will be installed for you.\nThis will take a few minutes, really good time to get a coffee or whatever you prefer.\n\nThis will need admin / sudo perms.\nClick OK to continue.',
            buttons: ['OK']
        }).then(async (response) => {
            const platform = process.platform;
            let downloadUrl;
            if (platform === 'win32') {
                downloadUrl = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
                await sudo.execSync('wsl --install -d Debian')
                .then(() => {
                    axios.get(downloadUrl, { responseType: 'arraybuffer' })
                    .then(async (response) => {
                        fs.writeFileSync(path.join(literalpath, './docker/docker-installer.exe'), response.data);
                        await execSync('start ' + literalpath + '/docker/docker-installer.exe');
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'Restart OS - NovAMPP',
                            message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                            buttons: ['OK']
                        }).then(async (response) => {
                            console.log('Docker installed');
                            execSync('shutdown -f -r -t 0');
                        });
                    })
                    .catch((error) => {
                        console.log('Failed to download Docker');
                    });
                });
            } else if (platform === 'linux') {
                const distro = fs.readFileSync('/etc/os-release', 'utf8');
                if (distro.includes('Ubuntu')) {
                    await sudo.execSync('apt-get update && apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnome-terminal && install -m 0755 /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && chmod a+r /etc/apt/keyrings/docker.asc && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && curl -o ' + literalpath + './docker/docker-installer.deb https://desktop.docker.com/linux/main/amd64/139021/docker-desktop-4.28.0-amd64.deb && apt-get -y install ' + literalpath + '/docker/docker-installer.deb');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Restart OS - NovAMPP',
                        message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        sudo.execSync('reboot now');
                        app.quit();
                        app.exit();
                    });
                } else if (distro.includes('Debian')) {
                    await sudo.execSync('apt-get update && apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnome-terminal && install -m 0755 /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && chmod a+r /etc/apt/keyrings/docker.asc && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && curl -o ' + literalpath + './docker/docker-installer.deb https://desktop.docker.com/linux/main/amd64/139021/docker-desktop-4.28.0-amd64.deb && apt-get -y install ' + literalpath + './docker/docker-installer.deb');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Restart OS - NovAMPP',
                        message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        sudo.execSync('reboot now');
                        app.quit();
                        app.exit();
                    });
                } else if (distro.includes('Red Hat')) {
                    const rhelVersion = distro.match(/(\d+)/);
                    if (rhelVersion && (rhelVersion[0] === '9')) {
                        await sudo.execSync('subscription-manager repos --enable codeready-builder-for-rhel-9-$(arch)-rpms && dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm && dnf -y install pass curl wget git gnome-terminal gnome-shell-extension-appindicator && gnome-extensions enable appindicatorsupport@rgcjonas.gmail.com && dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo && curl -o ' + literalpath + './docker/docker-installer.rpm https://desktop.docker.com/linux/main/amd64/139021/docker-desktop-4.28.0-x86_64.rpm && dnf -y install ' + literalpath + './docker/docker-installer.rpm');
                    } else if (rhelVersion && (rhelVersion[0] === '8')) {
                        await sudo.execSync('subscription-manager repos --enable codeready-builder-for-rhel-8-$(arch)-rpms && dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm && dnf -y install pass curl wget git gnome-terminal gnome-shell-extension-appindicator gnome-shell-extension-desktop-icons && gnome-shell-extension-tool -e appindicatorsupport@rgcjonas.gmail.com && dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo && curl -o ' + literalpath + './docker/docker-installer.rpm https://desktop.docker.com/linux/main/amd64/139021/docker-desktop-4.28.0-x86_64.rpm && dnf -y install ' + literalpath + './docker/docker-installer.rpm');
                    } else {
                        console.log('Unsupported Red Hat version');
                    };
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Restart OS - NovAMPP',
                        message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        sudo.execSync('reboot now');
                        app.quit();
                        app.exit();
                    });
                } else if (distro.includes('Fedora')) {
                    await sudo.execSync('dnf -y install pass curl wget git gnome-terminal dnf-plugins-core && dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo && dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && curl -o ' + literalpath + './docker/docker-installer.rpm https://desktop.docker.com/linux/main/amd64/139021/docker-desktop-4.28.0-x86_64.rpm && dnf -y install ' + literalpath + './docker/docker-installer.rpm');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Restart OS - NovAMPP',
                        message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        sudo.execSync('reboot now');
                        app.quit();
                        app.exit();
                    });
                } else if (distro.includes('Arch')) {
                    const yayInstalled = execSync('which yay').toString().trim();
                    if (yayInstalled) {
                        await execSync('yay -Syu --noconfirm docker-desktop');
                    } else {
                        await execSync('git clone https://aur.archlinux.org/yay.git');
                        await execSync('cd yay && makepkg -si --noconfirm');
                        await execSync('yay -Syu --noconfirm docker-desktop');
                        await execSync('cd .. && rm -rf yay');
                    };
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Restart OS - NovAMPP',
                        message: 'Docker has been installed, please save your work and press OK to restart your OS.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        sudo.execSync('reboot now');
                        app.quit();
                        app.exit();
                    });
                } else {
                    console.log('Unsupported Linux distribution');
                    exit(502);
                };
            } else if (platform === 'darwin') {
                const isIntel = execSync('sysctl -n machdep.cpu.brand_string').toString().includes('Intel');
                downloadUrl = isIntel ? 'https://desktop.docker.com/mac/main/amd64/Docker.dmg' : 'https://desktop.docker.com/mac/main/arm64/Docker.dmg';
                axios.get(downloadUrl, { responseType: 'arraybuffer' })
                .then(async (response) => {
                    fs.writeFileSync(path.join(literalpath, './docker/docker.dmg'), response.data);
                    await execSync('hdiutil attach ' + literalpath + '/docker/docker.dmg');
                    await execSync('cp -R /Volumes/Docker/Docker.app /Applications');
                    await execSync('hdiutil detach /Volumes/Docker');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Install Docker - NovAMPP',
                        message: 'Docker has been installed, please open Docker from your Applications folder.\nPlease accept the service agreement and use the recommended settings during setup.\nNovAMPP will now close, after opening Docker and setting it up, please reopen NovAMPP.',
                        buttons: ['OK']
                    }).then(async (response) => {
                        console.log('Docker installed');
                        app.quit();
                        app.exit();
                    });
                })
                .catch((error) => {
                    console.log('Failed to download Docker');
                });
            } else {
                console.log('Unsupported platform');
                return;
            };
        });
    });
};
module.exports = installdocker;