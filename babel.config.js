module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
            '@/src': './src',
            '@/app': './app',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/context': './src/context',
            '@/constants': './src/constants',
            '@/services': './src/services',
            '@/models': './src/models',
            '@/utils': './src/utils',
            '@/styles': './src/styles',
            '@/config': './src/config',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      'expo-router/babel',
    ],
  };
}; 