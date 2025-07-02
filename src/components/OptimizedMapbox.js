import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { 
  getMapImageWithCache, 
  preloadMapStyles, 
  MAPBOX_STYLES,
  checkNetworkConnectivity 
} from '../utils/mapboxCache';

// Import constants
import Colors from '../constants/Colors';

/**
 * OptimizedMapbox Component
 * 
 * Features:
 * - Intelligent caching to prevent reloading on style changes
 * - Offline fallback with graceful degradation
 * - Preloading of map styles for instant switching
 * - Network connectivity monitoring
 * - Error handling with user-friendly messages
 */
const OptimizedMapbox = ({
  location,
  initialStyle = 'satelliteStreets',
  size = '600x300',
  onPress,
  onStyleChange,
  showStyleButton = true,
  showDirectionsButton = true,
  onDirectionsPress,
  style,
  ...props
}) => {
  const [currentStyle, setCurrentStyle] = useState(MAPBOX_STYLES[initialStyle] || MAPBOX_STYLES.satelliteStreets);
  const [mapData, setMapData] = useState({ url: null, fromCache: false, offline: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [styleButtonPressed, setStyleButtonPressed] = useState(false);
  const [directionsButtonPressed, setDirectionsButtonPressed] = useState(false);

  // Memoize style names for display
  const styleDisplayName = useMemo(() => {
    return currentStyle.replace('-v11', '').replace('-v10', '').replace('-v9', '');
  }, [currentStyle]);

  // Load map image with caching
  const loadMapImage = useCallback(async (style) => {
    setIsLoading(true);
    
    try {
      const result = await getMapImageWithCache(style, location, size);
      setMapData(result);
      setIsOnline(!result.offline);
      
      // Map loaded successfully
      
    } catch (error) {
      setMapData({
        url: null,
        fromCache: false,
        offline: true,
        fallbackText: 'Map temporarily unavailable'
      });
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [location, size]);

  // Preload all map styles on component mount
  useEffect(() => {
    const initializeMap = async () => {
      // Load current style first
      await loadMapImage(currentStyle);
      
      // Preload other styles in background
      preloadMapStyles(location, size);
    };

    initializeMap();
  }, [loadMapImage, currentStyle, location, size]);

  // Monitor network connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      const online = await checkNetworkConnectivity();
      setIsOnline(online);
      
      // If we're back online and don't have a map, try to reload
      if (online && !mapData.url && mapData.offline) {
        loadMapImage(currentStyle);
      }
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);
    
    return () => clearInterval(interval);
  }, [mapData, currentStyle, loadMapImage]);

  // Cycle through map styles
  const cycleMapStyle = useCallback(async () => {
    const styles = Object.values(MAPBOX_STYLES);
    const currentIndex = styles.indexOf(currentStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const nextStyle = styles[nextIndex];
    
    setCurrentStyle(nextStyle);
    onStyleChange?.(nextStyle);
    
    // Load the new style (should be instant if cached)
    await loadMapImage(nextStyle);
  }, [currentStyle, onStyleChange, loadMapImage]);

  // Handle map press
  const handleMapPress = useCallback(() => {
    if (mapData.offline) {
      Alert.alert(
        'Map Unavailable',
        'Map is currently unavailable. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => loadMapImage(currentStyle) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    onPress?.();
  }, [mapData.offline, onPress, loadMapImage, currentStyle]);

  // Render offline fallback
  const renderOfflineFallback = () => (
    <View style={styles.offlineFallback}>
      <Ionicons name="map-outline" size={48} color={Colors.lightText} />
      <Text style={styles.offlineText}>
        {mapData.fallbackText || 'Map unavailable offline'}
      </Text>
      <Text style={styles.offlineSubtext}>
        {location.address}
      </Text>
      {isOnline && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => loadMapImage(currentStyle)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Loading map...</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Map Title */}
      <Text style={styles.mapTitle}>{location.address}</Text>
      
      {/* Style Indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.mapStyleIndicator}>
          Map Style: {styleDisplayName}
        </Text>
      </View>

      {/* Map Image Container */}
      <TouchableOpacity
        onPress={handleMapPress}
        activeOpacity={0.9}
        style={styles.mapImageContainer}
      >
        {isLoading && renderLoading()}
        
        {!isLoading && mapData.url && (
          <Image
            source={{ uri: mapData.url }}
            style={styles.mapImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            {...props}
          />
        )}
        
        {!isLoading && !mapData.url && renderOfflineFallback()}
      </TouchableOpacity>

      {/* Map Controls */}
      <View style={styles.mapButtonsContainer}>
        {showStyleButton && (
          <TouchableOpacity
            style={[
              styles.mapStyleButton,
              styleButtonPressed && styles.mapStyleButtonPressed
            ]}
            onPress={cycleMapStyle}
            onPressIn={() => setStyleButtonPressed(true)}
            onPressOut={() => setStyleButtonPressed(false)}
            activeOpacity={1}
          >
            <Ionicons name="map" size={16} color={Colors.white} />
            <Text style={[
              styles.mapButtonText,
              styleButtonPressed && styles.mapButtonTextPressed
            ]}>
              Change Style
            </Text>
          </TouchableOpacity>
        )}

        {showDirectionsButton && (
          <TouchableOpacity
            style={[
              styles.mapDirectionsButton,
              directionsButtonPressed && styles.mapDirectionsButtonPressed
            ]}
            onPress={onDirectionsPress}
            onPressIn={() => setDirectionsButtonPressed(true)}
            onPressOut={() => setDirectionsButtonPressed(false)}
            activeOpacity={1}
          >
            <Text style={[
              styles.mapDirectionsButtonText,
              directionsButtonPressed && styles.mapDirectionsButtonTextPressed
            ]}>
              Get Directions
            </Text>
            <Ionicons name="navigate" size={16} color={Colors.white} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d3e1e1',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#b7c9c9',
    padding: 12,
    marginHorizontal: 0,
    marginBottom: 0,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2a5d6b',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mapStyleIndicator: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  mapImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  offlineFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  offlineText: {
    fontSize: 16,
    color: Colors.lightText,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  offlineSubtext: {
    fontSize: 12,
    color: Colors.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mapButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    width: '100%',
  },
  mapStyleButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  mapDirectionsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  mapDirectionsButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapStyleButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  mapButtonTextPressed: {
    color: Colors.white,
  },
  mapDirectionsButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  mapDirectionsButtonTextPressed: {
    color: Colors.white,
  },
});

export default OptimizedMapbox; 