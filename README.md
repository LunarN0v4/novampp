# NovAMPP

NovAMPP (Nova's Apache2, MySQL, PHP and Perl server) is a dockerised alternative to already existing web server managers on Windows, Linux and macOS.  
This project is a direct response to issues that my high school has related to said alternative software by running in Docker, having a streamlined installer, and being easy for anyone who wants to start developing websites without being bombarded with unnecessarily complex GUIs.  

## Table of Contents

- [Installation](#installation)
- [macOS Installation](#macos-installation)
- [Uninstallation](#uninstallation)
- [Issues / Support](#issues--support)
- [Contributing](#contributing)
- [License](#license)

## Mirrors

This repository is mirrored on a GitLab self-hosted server (for the main repository) and GitHub (for issues and pull requests).  
- [GitLab Self-hosted](https://git.zeusteam.dev/nova/novampp)
- [GitHub](https://github.com/LunarN0v4/novampp)

## Installation
  
Simply run NovAMPP-Installer.exe if you're on Windows.  

For Linux, you need to either install the DEB or RPM package provided, or you need to use the Linux zip provided.  

## macOS Installation

Honestly, I have no idea if macOS installation even works right now, but here's how to install it as far as I know:  
Get the Darwin zip from releases, open it and drag the .app file to your Applications folder.  
If any warnings about code signing or untrusted apps come up, ignore them and proceed with installation.  
macOS will most likely stop you from running the app, open System Settings, click Privacy & Security, then click Open Anyway on the prompt to open NovAMPP.  
This tedious process is thanks to Apple's 'Gatekeeper', which is good at gatekeeping developers like me.  
This issue is better explained [here](https://support.apple.com/en-us/102445).  

## Uninstallation

Simply uninstall NovAMPP by using your operating system's built-in way of uninstalling apps / packages.  

Your data is located in "/usr/local/NovAMPP/" if you're on macOS or Linux, otherwise it's located in "%localappdata%\NovAMPP\" on Windows.  

## Contributing

On the [GitHub mirror](https://github.com/LunarN0v4/novampp), create a fork, make your changes in one or more Git commits, create a pull request and wait for your changes to be added to the main repository.  

## Issues / Support

For support and reporting issues, that should be done on the [GitHub mirror](https://github.com/LunarN0v4/novampp) of this repository, not on the main repo page. (This is due to the main repo page being on a GitLab self-hosted server, which is designed for private use, not public)

## License

This project is licensed under the Apache 2.0 open source license, which a copy of can be found in the included "LICENSE" file.  