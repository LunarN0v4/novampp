const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'NovAMPP',
    icon: './src/favicon',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32'],
      config: {
        name: 'NovAMPP',
        icon: './src/favicon',
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'NovAMPP',
        authors: 'Nova Notepad',
        exe: 'NovAMPP.exe',
        icon: './src/favicon',
        setupIcon: './src/favicon',
        setupExe: 'NovAMPP-Installer.exe',
        noMsi: true,
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'dev.nova.novampp',
          productName: 'NovAMPP',
          genericName: 'NovAMPP',
          description: 'NovAMPP, a simple dockerised web server.',
          productDescription: 'NovAMPP, a simple dockerised web server.',
          version: '1.0.0',
          section: 'devel',
          priority: 'optional',
          arch: ['x86_64', 'arm64'],
          depends: ['docker'],
          maintainer: 'Nova Notepad',
          homepage: 'https://git.zeusteam.dev/nova/novampp',
          icon: './src/favicon',
          categories: ['Development'],
          license: 'Apache-2.0',
          bin: 'NovAMPP',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'dev.nova.novampp',
          productName: 'NovAMPP',
          genericName: 'NovAMPP',
          description: 'NovAMPP, a simple dockerised web server.',
          productDescription: 'NovAMPP, a simple dockerised web server.',
          version: '1.0.0',
          section: 'devel',
          priority: 'optional',
          arch: ['x86_64', 'arm64'],
          depends: ['docker'],
          maintainer: 'Nova Notepad',
          homepage: 'https://git.zeusteam.dev/nova/novampp',
          icon: './src/favicon',
          categories: ['Development'],
          license: 'Apache-2.0',
          bin: 'NovAMPP',
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
