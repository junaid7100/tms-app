import { useState, useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';

/**
 * Custom hook for responsive dimensions that update on orientation changes
 * Optimized to prevent unnecessary re-renders
 */
export const useResponsiveDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(() => {
    return Dimensions.get('window');
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Memoize the calculated responsive values to prevent re-calculation on every render
  const responsiveValues = useMemo(() => {
    const { width, height } = windowDimensions;
    return {
      window: { width, height },
      isSmallDevice: width < 375,
      isTablet: width > 768,
      isMobile: width <= 480,
    };
  }, [windowDimensions.width, windowDimensions.height]);

  return responsiveValues;
}; 