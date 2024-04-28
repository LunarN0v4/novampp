const { ipcMain, dialog } = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
const { execSync } = require('child_process');
const util = require('util');
const execPromisified = util.promisify(execSync);
const linuxdarwin = `#!/bin/bash
if [[ -f /etc/lsb-release && $(cat /etc/lsb-release) == *"Ubuntu"* ]]; then
    apt-get update
    apt-get install -y ca-certificates curl gnome-terminal
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    curl -o /usr/local/novampp/docker-desktop.deb https://desktop.docker.com/linux/main/amd64/145265/docker-desktop-4.29.0-amd64.deb
    apt-get install -y --install-recommends --fix-missing /usr/local/novampp/docker-desktop.deb
    rm -f /usr/local/novampp/docker-desktop.deb
    exit 0
elif [[ -f /etc/debian_version ]]; then
    apt-get update
    apt-get install -y ca-certificates curl gnome-terminal
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    curl -o /usr/local/novampp/docker-desktop.deb https://desktop.docker.com/linux/main/amd64/145265/docker-desktop-4.29.0-amd64.deb
    apt-get install -y --install-recommends --fix-missing /usr/local/novampp/docker-desktop.deb
    rm -f /usr/local/novampp/docker-desktop.deb
    exit 0
#elif [[ -f /etc/redhat-release && $(cat /etc/redhat-release) == *"release 8"* ]]; then
#    subscription-manager repos --enable codeready-builder-for-rhel-8-$(arch)-rpms
#    dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
#    dnf install pass
#    if [[ -f /usr/bin/gnome-shell-extension-tool ]]; then
#        dnf install -y gnome-shell-extension-appindicator
#        dnf install -y gnome-shell-extension-desktop-icons
#        gnome-shell-extension-tool -e appindicatorsupport@rgcjonas.gmail.com
#    else
#        dnf install -y gnome-terminal
#    fi
#    dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
#    curl -o /usr/local/novampp/docker-desktop.rpm
#    dnf install -y /usr/local/novampp/docker-desktop.rpm
#    rm -f /usr/local/novampp/docker-desktop.rpm
#    exit 0
#elif [[ -f /etc/redhat-release && $(cat /etc/redhat-release) == *"release 9"* ]]; then
#    subscription-manager repos --enable codeready-builder-for-rhel-9-$(arch)-rpms
#    dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
#    dnf install pass
#    if [[ -f /usr/bin/gnome-extensions ]]; then
#        dnf install -y gnome-shell-extension-appindicator
#        gnome-extensions enable appindicatorsupport@rgcjonas.gmail.com
#    else
#        dnf install -y gnome-terminal
#    fi
#    dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
#    curl -o /usr/local/novampp/docker-desktop.rpm 
#    dnf install -y /usr/local/novampp/docker-desktop.rpm
#    rm -f /usr/local/novampp/docker-desktop.rpm
#    exit 0
elif [[ -f /etc/redhat-release && $(cat /etc/redhat-release) == *"Fedora"* ]]; then
    dnf install -y ca-certificates curl gnome-terminal dnf-plugins-core
    dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
    curl -o /usr/local/novampp/docker-desktop.rpm https://desktop.docker.com/linux/main/amd64/145265/docker-desktop-4.29.0-x86_64.rpm
    dnf install -y /usr/local/novampp/docker-desktop.rpm
    rm -f /usr/local/novampp/docker-desktop.rpm
    exit 0
elif [[ -f /etc/arch-release ]]; then
    pacman -Syy
    pacman -S --noconfirm --needed ca-certificates curl gnome-terminal git desktop-file-utils docker gtk3 libcap-ng libseccomp libx11 pass qemu-full shadow w3m
    git clone https://aur.archlinux.org/docker-desktop.git /usr/local/novampp/docker-desktop
    cd /usr/local/novampp/docker-desktop
    makepkg -si --noconfirm
    cd ..
    rm -rf /usr/local/novampp/docker-desktop
    exit 0
elif [[ $(uname -s) == "Darwin" ]]; then
    if [[ $(uname -p) == "arm" ]]; then
        curl -o /usr/local/novampp/docker-desktop.dmg https://desktop.docker.com/mac/main/arm64/Docker.dmg
    else
        curl -o /usr/local/novampp/docker-desktop.dmg https://desktop.docker.com/mac/main/amd64/Docker.dmg
    fi
    softwareupdate --install-rosetta
    hdiutil attach /usr/local/novampp/docker-desktop.dmg
    /Volumes/Docker/Docker.app/Contents/MacOS/Docker --accept-license
    hdiutil detach /Volumes/Docker
    rm -f /usr/local/novampp/docker-desktop.dmg
    exit 0
else
    echo "Unsupported OS"
    exit 1
fi`;
const windowswsl = `@echo off
wsl --install -d Debian`;
function installdocker() {
    ipcMain.handle('install-docker', async (event) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Install Docker - NovAMPP',
            message: 'Docker is required to run NovAMPP, this will be installed for you.\nThis will take a few minutes, really good time to get a coffee or whatever you prefer.\n\nThis will need admin / sudo perms.\nClick OK to continue.',
            buttons: ['OK']
        }).then(async (response) => {
            const platform = process.platform;
            if (platform === 'win32') {
                try {
                    fs.writeFileSync(literalpath + '/installwsl.bat', windowswsl);
                    await execPromisified('start /wait ' + literalpath + '\\installwsl.bat', { shell: true, windowsHide: true, admin: true });
                    await axios.get('https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe').then((response) => {
                        fs.writeFileSync(literalpath + '/docker-desktop.exe', response.data, 'binary');
                        execPromisified('start /wait ' + literalpath + '\\docker-desktop.exe', { shell: true, windowsHide: true, admin: true });
                    }).catch((error) => {
                        console.log(error);
                        return 'fail';
                    });
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Install Docker - NovAMPP',
                        message: 'Docker has been installed, please restart NovAMPP to continue.',
                        buttons: ['OK']
                    }).then((response) => {
                        fs.unlinkSync(literalpath + '/installwsl.bat');
                        fs.unlinkSync(literalpath + '/docker-desktop.exe');
                        app.quit();
                        app.exit();
                        return 'success';
                    });
                } catch (error) {
                    console.log(error);
                    return 'fail';
                };
            } else if (platform === 'linux') {
                try {
                    fs.writeFileSync('/usr/local/novampp/installdocker.sh', linuxdarwin);
                    await execPromisified('xterm -e "sudo /bin/bash -c /usr/local/novampp/installdocker.sh"');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Install Docker - NovAMPP',
                        message: 'Docker has been installed, please restart NovAMPP to continue.',
                        buttons: ['OK']
                    }).then((response) => {
                        fs.unlinkSync('/usr/local/novampp/installdocker.sh');
                        app.quit();
                        app.exit();
                        return 'success';
                    });
                } catch (error) {
                    console.log(error);
                    return 'fail';
                };
            } else if (platform === 'darwin') {
                try {
                    fs.writeFileSync('/usr/local/novampp/installdocker.sh', linuxdarwin);
                    await execPromisified('open -a Terminal -n -e "sudo /bin/bash -c /usr/local/novampp/installdocker.sh"');
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Install Docker - NovAMPP',
                        message: 'Docker has been installed, please restart NovAMPP to continue.',
                        buttons: ['OK']
                    }).then((response) => {
                        fs.unlinkSync('/usr/local/novampp/installdocker.sh');
                        app.quit();
                        app.exit();
                        return 'success';
                    });
                } catch (error) {
                    console.log(error);
                    return 'fail';
                };
            } else {
                console.log('Unsupported platform');
                return 'fail';
            };
        });
    });
};
module.exports = installdocker;