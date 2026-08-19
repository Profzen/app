// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs', 'cjs');

// Polyfill Node core modules
config.resolver.extraNodeModules = {
  punycode: require.resolve('punycode/'),
};

module.exports = config;
