// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .types extension resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'types'];

module.exports = config;
