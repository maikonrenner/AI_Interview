module.exports = {
  packagerConfig: {
    asar: true,
    icon: './public/icon',
    executableName: 'AI_Interview'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Interview_IA'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'AI_Interview',
          productName: 'Interview-IA',
          genericName: 'AI Programming Assistant',
          description: 'AI-powered overlay assistant for programming interviews and coding challenges',
          categories: ['Development', 'Utility']
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};
