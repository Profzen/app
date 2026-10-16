import { Dimensions, useWindowDimensions, PixelRatio, Platform } from 'react-native';

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
    isSmallDevice: width < 380 || height < 700,
    isNarrowDevice: width < 360,
    isShortDevice: height < 700,
    isTablet: width >= 600,
  };
};

export const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// isSmallScreen (width < 380 or height < 700) for compact paddings/icon sizes
export const isSmallScreen = SCREEN_WIDTH < 380 || SCREEN_HEIGHT < 700;
export const isShortScreen = SCREEN_HEIGHT < 700;

/**
 * Hook to dynamically detect small screen state on dimension change
 */
export const useIsSmallScreen = () => {
  const { width, height } = useWindowDimensions();
  return width < 380 || height < 700;
};

/**
 * useGridColumns:
 * Computes columns and itemWidth dynamically from useWindowDimensions().
 * On phones (< 600dp), guarantees 2 columns (never 1 per row with empty space).
 * On wide screens (>= 600dp), allows 3 columns up to maxColumns.
 *
 * @param {Object} options
 * @param {number} [options.minItemWidth=140] Minimum item width before wrapping
 * @param {number} [options.maxColumns=3] Maximum number of columns
 * @param {number} [options.padding=32] Total horizontal screen padding
 * @param {number} [options.gap=12] Gap between columns
 * @returns {{ columns: number, itemWidth: number, gap: number, availableWidth: number, screenWidth: number, screenHeight: number, isSmallScreen: boolean }}
 */
export const useGridColumns = ({
  minItemWidth = 140,
  maxColumns = 3,
  padding = 32,
  gap = 12,
} = {}) => {
  const { width, height } = useWindowDimensions();
  const availableWidth = Math.max(0, width - padding);

  let columns = 2;
  if (width >= 600) {
    const computedWide = Math.floor((availableWidth + gap) / (minItemWidth + gap));
    columns = Math.min(Math.max(computedWide, 3), maxColumns);
  } else if (width < 300) {
    columns = 1;
  } else {
    // Standard phone screen (360dp to 599dp): strictly 2 columns
    columns = 2;
  }

  columns = Math.max(1, Math.min(columns, maxColumns));

  const totalGap = (columns - 1) * gap;
  const itemWidth = Math.floor((availableWidth - totalGap) / columns);
  const isSmall = width < 380 || height < 700;

  return {
    columns,
    itemWidth,
    gap,
    availableWidth,
    screenWidth: width,
    screenHeight: height,
    isSmallScreen: isSmall,
  };
};

export default {
  scale,
  verticalScale,
  moderateScale,
  getDeviceDimensions,
  windowWidth,
  windowHeight,
  isSmallScreen,
  isShortScreen,
  useIsSmallScreen,
  useGridColumns,
};
