import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * App layout constants
 */
export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width > 768,
  isMobile: width <= 480,
  spacing: {
    small: 5,
    medium: 10,
    large: 15,
    xlarge: 20,
    xxlarge: 30,
  },
  borderRadius: {
    small: 5,
    medium: 8,
    large: 12,
    xlarge: 18,
    xxlarge: 24,
    round: 50,
  },
};
