import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

/**
 * HeroImage Component
 * 
 * Specialized component for hero background images with:
 * - Aggressive caching for large images
 * - Progressive loading with blur placeholder
 * - Memory optimization
 * - Responsive sizing
 */
const HeroImage = ({
  source,
  style,
  children,
  height = 220,
  priority = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  const handleError = (error) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  // Generate optimized source for hero images
  const getOptimizedSource = () => {
    if (typeof source === 'string') {
      return {
        uri: source,
        width: screenWidth,
        height: height,
      };
    }
    return source;
  };

  const containerStyle = [
    styles.container,
    { height },
    style
  ];

  const imageStyle = [
    styles.image,
    hasError && styles.error
  ];

  return (
    <View style={containerStyle}>
      <Image
        source={getOptimizedSource()}
        style={imageStyle}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority={priority ? "high" : "normal"}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        onLoad={handleLoad}
        onError={handleError}
        transition={300}
        {...props}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      
      {children && (
        <View style={styles.overlay}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  error: {
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default HeroImage; 