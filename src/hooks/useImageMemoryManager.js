import { useEffect } from 'react';
import { AppState } from 'react-native';
import { clearImageCache } from '../utils/imageCache';

/**
 * Hook to manage image memory and handle low memory situations
 */
export const useImageMemoryManager = () => {
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      // Clear memory cache when app goes to background to free up memory
      if (nextAppState === 'background') {
        clearImageCache();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Function to manually clear cache when memory is low
  const clearCacheOnLowMemory = () => {
    clearImageCache();
  };

  return {
    clearCacheOnLowMemory,
  };
};

export default useImageMemoryManager; 