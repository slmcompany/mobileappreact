const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Thêm các đường dẫn bổ sung
config.resolver.extraNodeModules = {
  '@': __dirname,
  '@/src': `${__dirname}/src`,
  '@/app': `${__dirname}/app`,
  '@/components': `${__dirname}/src/components`,
  '@/hooks': `${__dirname}/src/hooks`,
  '@/context': `${__dirname}/src/context`,
  '@/constants': `${__dirname}/src/constants`,
  '@/services': `${__dirname}/src/services`,
  '@/models': `${__dirname}/src/models`,
  '@/utils': `${__dirname}/src/utils`,
  '@/styles': `${__dirname}/src/styles`,
  '@/config': `${__dirname}/src/config`,
};

// Cập nhật watchFolders để bao gồm thư mục src và app
config.watchFolders = [
  ...config.watchFolders || [],
  `${__dirname}/src`,
  `${__dirname}/app`,
];

module.exports = config; 