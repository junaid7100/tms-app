import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

// Import constants
import Colors from '../constants/Colors';

// Conditional WebView import with error handling
let WebView;
try {
  WebView = require('react-native-webview').WebView;
} catch (error) {
  console.warn('WebView not available, using iOS MapView only');
  WebView = null;
}

/**
 * OptimizedNativeMap Component
 * 
 * Features:
 * - Uses Apple MapKit on iOS (free, no API key required)
 * - Uses OpenStreetMap via WebView on Android when available (free, no API key required)
 * - Fallback to react-native-maps on Android if WebView is not available
 * - Map type switching functionality
 * - Maintains same UI as original Mapbox component
 * - Error handling with user-friendly messages
 */

// Map types for different platforms
const MAP_TYPES = {
  ios: [
    { key: 'standard', name: 'Standard', type: 'standard' },
    { key: 'satellite', name: 'Satellite', type: 'satellite' },
    { key: 'hybrid', name: 'Hybrid', type: 'hybrid' },
    { key: 'mutedStandard', name: 'Muted', type: 'mutedStandard' },
    { key: 'satelliteFlyover', name: 'Flyover', type: 'satelliteFlyover' },
    { key: 'hybridFlyover', name: 'Hybrid Flyover', type: 'hybridFlyover' }
  ],
  android: WebView ? [
    { key: 'osm', name: 'OpenStreetMap', type: 'osm' },
    { key: 'osmCycle', name: 'Cycle Map', type: 'osmCycle' },
    { key: 'osmTransport', name: 'Transport', type: 'osmTransport' },
    { key: 'osmHumanitarian', name: 'Humanitarian', type: 'osmHumanitarian' }
  ] : [
    { key: 'standard', name: 'Standard', type: 'standard' },
    { key: 'satellite', name: 'Satellite', type: 'satellite' },
    { key: 'hybrid', name: 'Hybrid', type: 'hybrid' },
    { key: 'terrain', name: 'Terrain', type: 'terrain' }
  ]
};

// OpenStreetMap tile servers for Android (when WebView is available)
const OSM_TILE_SERVERS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  osmCycle: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
  osmTransport: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
  osmHumanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
};

const OptimizedNativeMap = ({
  location,
  initialStyle = 'standard',
  onPress,
  onStyleChange,
  showStyleButton = true,
  showDirectionsButton = true,
  onDirectionsPress,
  style,
  ...props
}) => {
  const currentMapTypes = Platform.OS === 'ios' ? MAP_TYPES.ios : MAP_TYPES.android;
  const [currentMapType, setCurrentMapType] = useState(
    currentMapTypes.find(type => type.key === initialStyle) || currentMapTypes[0]
  );
  const [styleButtonPressed, setStyleButtonPressed] = useState(false);
  const [directionsButtonPressed, setDirectionsButtonPressed] = useState(false);
  const [webViewError, setWebViewError] = useState(false);

  // Map region configuration
  const mapRegion = useMemo(() => ({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [location.latitude, location.longitude]);

  // Marker configuration
  const markerCoordinate = useMemo(() => ({
    latitude: location.latitude,
    longitude: location.longitude,
  }), [location.latitude, location.longitude]);

  // Determine if we should use WebView on Android
  const shouldUseWebView = Platform.OS === 'android' && WebView && !webViewError;

  // Generate OpenStreetMap HTML for Android
  const generateOSMHTML = useCallback(() => {
    if (!shouldUseWebView) return '';
    
    const { latitude, longitude } = location;
    const markerColor = location.markerColor || 'red';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenStreetMap</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
            try {
                var map = L.map('map', {
                    center: [${latitude}, ${longitude}],
                    zoom: 15,
                    zoomControl: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false,
                    dragging: false,
                    touchZoom: false
                });

                var tileLayer = L.tileLayer('${OSM_TILE_SERVERS[currentMapType.key] || OSM_TILE_SERVERS.osm}', {
                    attribution: '© OpenStreetMap contributors',
                    subdomains: ['a', 'b', 'c']
                }).addTo(map);

                var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
                marker.bindPopup('${location.address}');

                // Handle map clicks
                map.on('click', function(e) {
                    window.ReactNativeWebView?.postMessage('mapPressed');
                });
            } catch (error) {
                console.error('Map initialization failed:', error);
                window.ReactNativeWebView?.postMessage('error');
            }
        </script>
    </body>
    </html>
    `;
  }, [location, currentMapType, shouldUseWebView]);

  // Cycle through map types
  const cycleMapType = useCallback(() => {
    const currentIndex = currentMapTypes.findIndex(type => type.key === currentMapType.key);
    const nextIndex = (currentIndex + 1) % currentMapTypes.length;
    const nextMapType = currentMapTypes[nextIndex];
    
    setCurrentMapType(nextMapType);
    onStyleChange?.(nextMapType.key);
  }, [currentMapType, currentMapTypes, onStyleChange]);

  // Handle map press
  const handleMapPress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  // Handle WebView messages (Android)
  const handleWebViewMessage = useCallback((event) => {
    const message = event.nativeEvent.data;
    if (message === 'mapPressed') {
      handleMapPress();
    } else if (message === 'error') {
      console.warn('WebView map initialization failed, falling back to react-native-maps');
      setWebViewError(true);
    }
  }, [handleMapPress]);

  // Handle WebView error
  const handleWebViewError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    setWebViewError(true);
  }, []);

  // Handle directions button press
  const handleDirectionsPress = useCallback(() => {
    if (onDirectionsPress) {
      onDirectionsPress();
    } else {
      // Default behavior - open in system maps
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${location.latitude},${location.longitude}`;
      const label = encodeURIComponent(location.address);
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });

      import('react-native').then(({ Linking }) => {
        Linking.openURL(url).catch(err => {
          Alert.alert('Error', 'Unable to open maps application');
        });
      });
    }
  }, [onDirectionsPress, location]);

  // Render Native MapView (iOS or Android fallback)
  const renderNativeMap = () => (
    <TouchableOpacity
      onPress={handleMapPress}
      activeOpacity={0.9}
      style={styles.mapImageContainer}
    >
      <MapView
        style={styles.map}
        region={mapRegion}
        mapType={currentMapType.type}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        {...props}
      >
        <Marker
          coordinate={markerCoordinate}
          title={location.address}
          pinColor={location.markerColor ? `#${location.markerColor}` : '#f74e4e'}
        />
      </MapView>
    </TouchableOpacity>
  );

  // Render Android OpenStreetMap
  const renderAndroidWebViewMap = () => {
    if (!WebView || !shouldUseWebView) {
      return renderNativeMap();
    }

    return (
      <TouchableOpacity
        onPress={handleMapPress}
        activeOpacity={0.9}
        style={styles.mapImageContainer}
      >
        <WebView
          style={styles.map}
          source={{ html: generateOSMHTML() }}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </TouchableOpacity>
    );
  };

  // Determine map provider name for display
  const getMapProviderName = () => {
    if (Platform.OS === 'ios') {
      return '(Apple Maps)';
    } else if (shouldUseWebView) {
      return '(OpenStreetMap)';
    } else {
      return '(Native Maps)';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map Title */}
      <Text style={styles.mapTitle}>{location.address}</Text>
      
      {/* Style Indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.mapStyleIndicator}>
          Map Style: {currentMapType.name}
        </Text>
        <Text style={styles.mapProviderIndicator}>
          {getMapProviderName()}
        </Text>
      </View>

      {/* Map Container */}
      {Platform.OS === 'ios' || !shouldUseWebView ? renderNativeMap() : renderAndroidWebViewMap()}

      {/* Map Controls */}
      <View style={styles.mapButtonsContainer}>
        {showStyleButton && (
          <TouchableOpacity
            style={[
              styles.mapStyleButton,
              styleButtonPressed && styles.mapStyleButtonPressed
            ]}
            onPress={cycleMapType}
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
            onPress={handleDirectionsPress}
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
    marginRight: 4,
  },
  mapProviderIndicator: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    width: '100%',
    height: '100%',
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

export default OptimizedNativeMap; 