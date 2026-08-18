import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline base dimensions based on standard mobile mockup (iPhone 11/12/13/14 Pro base: 390 x 844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scales size horizontally based on screen width.
 */
export const scale = (size) => {
  const currentWidth = Dimensions.get('window').width;
  return (currentWidth / BASE_WIDTH) * size;
};

/**
 * Scales size vertically based on screen height.
 */
export const verticalScale = (size) => {
  const currentHeight = Dimensions.get('window').height;
  return (currentHeight / BASE_HEIGHT) * size;
};

/**
 * Moderate scale with customizable factor (default: 0.5)
 * Great for font sizes and padding that should scale gracefully without becoming too large or small.
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

/**
 * Device size flags for responsive conditional styling
 */
export const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isSmallDevice: width <= 375 || height <= 680,   // iPhone SE, iPhone 8, small Android
    isNarrowDevice: width < 360,                   // Ultra-compact devices
    isShortDevice: height < 700,                   // iPhone SE (667px height)
    isTablet: width >= 768,                        // iPads & tablets
  };
};

export const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
export const isSmallScreen = SCREEN_WIDTH <= 375 || SCREEN_HEIGHT <= 680;
export const isShortScreen = SCREEN_HEIGHT < 700;

export default {
  scale,
  verticalScale,
  moderateScale,
  getDeviceDimensions,
  windowWidth,
  windowHeight,
  isSmallScreen,
  isShortScreen,
};
