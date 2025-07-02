import { Image } from 'expo-image';

/**
 * Image Cache Utility
 * 
 * Provides centralized image caching management and preloading
 */

// Cache configuration
const CACHE_CONFIG = {
  // High priority images (hero images, above-the-fold content)
  HIGH_PRIORITY: {
    cachePolicy: 'memory-disk',
    priority: 'high',
    transition: 300,
  },
  
  // Normal priority images (content images)
  NORMAL_PRIORITY: {
    cachePolicy: 'memory-disk',
    priority: 'normal',
    transition: 200,
  },
  
  // Low priority images (below-the-fold content)
  LOW_PRIORITY: {
    cachePolicy: 'disk',
    priority: 'low',
    transition: 100,
  },
};

/**
 * Preload critical images for better performance
 * For local bundled assets (require statements), no preloading is needed
 * as they're already part of the app bundle and immediately available
 */
export const preloadCriticalImages = () => {
  // Local assets are bundled with the app and available immediately
  // No preloading needed - this function exists for API compatibility
  return Promise.resolve();
};

/**
 * Initialize images for a specific screen
 * For local assets, this just confirms they're ready
 * For remote assets, this would prefetch them
 */
export const preloadScreenImages = async (screenName) => {
  // Screen image mapping for reference
  const screenImageCounts = {
    about: 6, // hero, video thumbnail, 4 team members
    treatment: 3, // video thumbnail, treatment image, device image
    contact: 2, // hero, contact background
    newPatients: 7, // hero, insurance logos
  };

  const imageCount = screenImageCounts[screenName];
  if (!imageCount) return;

  try {
    // For local assets, they're bundled and ready immediately
    // expo-image will handle optimized loading and caching
  } catch (error) {
    // Silent fail for production
  }
};

/**
 * Preload remote images (for URLs, not local assets)
 * Use this for images loaded from APIs or CDNs
 */
export const preloadRemoteImages = async (imageUrls, priority = 'normal') => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

  try {
    const cacheConfig = CACHE_CONFIG[priority.toUpperCase() + '_PRIORITY'] || CACHE_CONFIG.NORMAL_PRIORITY;
    
    await Promise.all(
      imageUrls.map(url => {
        if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('https'))) {
          return Image.prefetch(url, cacheConfig);
        }
        return Promise.resolve();
      })
    );
    console.log(`Successfully preloaded ${imageUrls.length} remote images`);
  } catch (error) {
    console.warn('Failed to preload some remote images:', error);
  }
};

/**
 * Clear image cache when memory is low
 */
export const clearImageCache = async () => {
  try {
    await Image.clearMemoryCache();
  } catch (error) {
    // Silent fail for production
  }
};

/**
 * Clear disk cache (use sparingly)
 */
export const clearDiskCache = async () => {
  try {
    await Image.clearDiskCache();
  } catch (error) {
    // Silent fail for production
  }
};

/**
 * Get optimized image props based on priority
 */
export const getImageProps = (priority = 'normal') => {
  return CACHE_CONFIG[priority.toUpperCase() + '_PRIORITY'] || CACHE_CONFIG.NORMAL_PRIORITY;
};

/**
 * Generate responsive image source with size hints
 */
export const getResponsiveSource = (source, dimensions) => {
  if (typeof source === 'string') {
    return {
      uri: source,
      width: dimensions.width,
      height: dimensions.height,
    };
  }
  return source;
};

export default {
  preloadCriticalImages,
  preloadScreenImages,
  preloadRemoteImages,
  clearImageCache,
  clearDiskCache,
  getImageProps,
  getResponsiveSource,
  CACHE_CONFIG,
}; 