import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Mapbox Cache Utility
 * 
 * Provides caching for Mapbox static images and offline fallback handling
 */

const CACHE_PREFIX = 'mapbox_cache_';
const CACHE_EXPIRY_HOURS = 24; // Cache images for 24 hours
const MAX_CACHE_SIZE = 10; // Maximum number of cached map images

// Mapbox configuration
export const MAPBOX_TOKEN = "pk.eyJ1IjoicmFtc2hhbWFsaWsiLCJhIjoiY2x2MnZqZ2R0MGRydzJpcGZoYW0wMW5pdSJ9._VUx5z0bwIRtFhZHF3_cFQ";

export const MAPBOX_STYLES = {
  streets: "streets-v11",
  outdoors: "outdoors-v11",
  light: "light-v10",
  dark: "dark-v10",
  satellite: "satellite-v9",
  satelliteStreets: "satellite-streets-v11"
};

/**
 * Generate Mapbox static image URL
 */
export const generateMapboxURL = (style, location, size = '600x300') => {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/pin-s+${location.markerColor}(${location.longitude},${location.latitude})/${location.longitude},${location.latitude},${location.zoom},0/${size}?access_token=${MAPBOX_TOKEN}`;
};

/**
 * Generate cache key for a map configuration
 */
const generateCacheKey = (style, location, size) => {
  return `${CACHE_PREFIX}${style}_${location.latitude}_${location.longitude}_${location.zoom}_${size}`;
};

/**
 * Check if cached image is still valid
 */
const isCacheValid = (timestamp) => {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convert to milliseconds
  return (now - timestamp) < expiryTime;
};

/**
 * Get cached map image URL if available and valid
 */
export const getCachedMapImage = async (style, location, size = '600x300') => {
  try {
    const cacheKey = generateCacheKey(style, location, size);
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { url, timestamp } = JSON.parse(cachedData);
      
      if (isCacheValid(timestamp)) {
        // Check if the image is still cached by expo-image
        const imageExists = await Image.getCachePathAsync(url);
        if (imageExists) {
          return url;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get cached map image:', error);
    return null;
  }
};

/**
 * Cache map image URL with timestamp
 */
export const cacheMapImage = async (style, location, url, size = '600x300') => {
  try {
    const cacheKey = generateCacheKey(style, location, size);
    const cacheData = {
      url,
      timestamp: Date.now(),
      style,
      location,
      size
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    // Preload the image to expo-image cache
    await Image.prefetch(url, { cachePolicy: 'memory-disk' });
    
    // Clean up old cache entries
    await cleanupOldCache();
    
  } catch (error) {
    // Silent fail for production
  }
};

/**
 * Clean up old cache entries to prevent storage bloat
 */
const cleanupOldCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const mapboxKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (mapboxKeys.length > MAX_CACHE_SIZE) {
      // Get all cached items with timestamps
      const cachedItems = await Promise.all(
        mapboxKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          return { key, ...JSON.parse(data) };
        })
      );
      
      // Sort by timestamp (oldest first)
      cachedItems.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const itemsToRemove = cachedItems.slice(0, cachedItems.length - MAX_CACHE_SIZE);
      const keysToRemove = itemsToRemove.map(item => item.key);
      
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    // Silent fail for production
  }
};

/**
 * Check network connectivity
 */
export const checkNetworkConnectivity = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  } catch (error) {
    return false;
  }
};

/**
 * Get map image with caching and offline fallback
 */
export const getMapImageWithCache = async (style, location, size = '600x300') => {
  try {
    // First, try to get from cache
    const cachedUrl = await getCachedMapImage(style, location, size);
    if (cachedUrl) {
      return {
        url: cachedUrl,
        fromCache: true,
        offline: false
      };
    }
    
    // Check network connectivity
    const isOnline = await checkNetworkConnectivity();
    
    if (!isOnline) {
      // Return offline fallback
      return {
        url: null,
        fromCache: false,
        offline: true,
        fallbackText: 'Map unavailable offline'
      };
    }
    
    // Generate new URL and cache it
    const url = generateMapboxURL(style, location, size);
    await cacheMapImage(style, location, url, size);
    
    return {
      url,
      fromCache: false,
      offline: false
    };
    
  } catch (error) {
    console.warn('Failed to get map image:', error);
    return {
      url: null,
      fromCache: false,
      offline: true,
      error: error.message,
      fallbackText: 'Map temporarily unavailable'
    };
  }
};

/**
 * Preload all map styles for better performance
 */
export const preloadMapStyles = async (location, size = '600x300') => {
  try {
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) return;
    
    const styles = Object.values(MAPBOX_STYLES);
    
    await Promise.all(
      styles.map(async (style) => {
        const cachedUrl = await getCachedMapImage(style, location, size);
        if (!cachedUrl) {
          const url = generateMapboxURL(style, location, size);
          await cacheMapImage(style, location, url, size);
        }
      })
    );
    
    console.log('Successfully preloaded all map styles');
  } catch (error) {
    console.warn('Failed to preload map styles:', error);
  }
};

/**
 * Clear all map cache
 */
export const clearMapCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const mapboxKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (mapboxKeys.length > 0) {
      await AsyncStorage.multiRemove(mapboxKeys);
    }
  } catch (error) {
    // Silent fail for production
  }
};

export default {
  generateMapboxURL,
  getCachedMapImage,
  cacheMapImage,
  checkNetworkConnectivity,
  getMapImageWithCache,
  preloadMapStyles,
  clearMapCache,
  MAPBOX_TOKEN,
  MAPBOX_STYLES
}; 