const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'NovAMPP',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'NovAMPP',
        authors: 'Nova Notepad',
        exe: 'NovAMPP',
        setupIcon: './src/favicon.png',
        setupExe: 'NovAMPP-Installer.exe',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'NovAMPP',
          productName: 'NovAMPP',
          genericName: 'NovAMPP',
          description: 'NovAMPP, a simple dockerised web server.',
          productDescription: 'NovAMPP, a simple dockerised web server.',
          version: '1.0.0',
          revision: '1',
          section: 'devel',
          priority: 'optional',
          arch: 'amd64',
          depends: ['docker', 'docker-compose'],
          maintainer: 'Nova Notepad',
          homepage: 'https://git.zeusteam.dev/nova/novampp',
          icon: './src/favicon.png',
          categories: ['Development'],
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'NovAMPP',
          productName: 'NovAMPP',
          genericName: 'NovAMPP',
          description: 'NovAMPP, a simple dockerised web server.',
          productDescription: 'NovAMPP, a simple dockerised web server.',
          version: '1.0.0',
          revision: '1',
          section: 'devel',
          priority: 'optional',
          arch: 'x86_64',
          depends: ['docker', 'docker-compose'],
          maintainer: 'Nova Notepad',
          homepage: 'https://git.zeusteam.dev/nova/novampp',
          icon: './src/favicon.png',
          categories: ['Development'],
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
