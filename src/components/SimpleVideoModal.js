import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimpleVideoModal = ({ 
  visible, 
  onClose, 
  videoUri, 
  title = "TMS Video" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleClose = () => {
    setIsLoading(true);
    setHasError(false);
    onClose();
  };

  const handleOpenExternal = async () => {
    try {
      const canOpen = await Linking.canOpenURL(videoUri);
      if (canOpen) {
        await Linking.openURL(videoUri);
        handleClose();
      } else {
        Alert.alert('Error', 'Unable to open video externally');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open video externally');
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
  };

  // Simple HTML for video
  const videoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                background: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                width: 100vw;
                overflow: hidden;
            }
            video {
                width: 100%;
                height: 100%;
                object-fit: contain;
                background: #000;
            }
            .controls {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                padding: 10px 20px;
                border-radius: 5px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <video 
            id="video"
            controls
            playsinline
            webkit-playsinline
            controlslist="nodownload"
            preload="metadata"
            style="width: 100%; height: 100%;"
        >
            <source src="${videoUri}" type="video/mp4">
            <source src="${videoUri}" type="video/m4v">
            <source src="${videoUri}" type="video/webm">
            <p style="color: white; text-align: center; padding: 20px;">
                Your browser doesn't support video playback.
            </p>
        </video>
        
        <script>
            const video = document.getElementById('video');
            
            // Send loaded message when video is ready
            video.addEventListener('loadeddata', function() {
                console.log('Video loaded successfully');
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('loaded');
                }
            });
            
            video.addEventListener('canplay', function() {
                console.log('Video can play');
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('loaded');
                }
            });
            
            // Handle errors
            video.addEventListener('error', function(e) {
                console.log('Video error:', e);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('error');
                }
            });
            
            // Fallback timeout
            setTimeout(function() {
                if (video.readyState < 2) {
                    console.log('Video loading timeout');
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage('error');
                    }
                }
            }, 15000);
        </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close video"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {isLoading && !hasError && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Loading video...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}

        {/* Error */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color={Colors.white} />
            <Text style={styles.errorText}>Unable to load video</Text>
            <Text style={styles.errorSubtext}>Please check your internet connection</Text>
            
            <View style={styles.errorButtons}>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={handleRetry}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.externalButton} 
                onPress={handleOpenExternal}
                activeOpacity={0.7}
              >
                <Ionicons name="open-outline" size={16} color={Colors.white} />
                <Text style={styles.externalButtonText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Video */}
        {!hasError && (
          <View style={styles.videoWrapper}>
            <WebView
              source={{ html: videoHTML }}
              style={styles.webview}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              onMessage={(event) => {
                const message = event.nativeEvent.data;
                console.log('Video message:', message);
                if (message === 'loaded') {
                  setIsLoading(false);
                  setHasError(false);
                } else if (message === 'error') {
                  setIsLoading(false);
                  setHasError(true);
                }
              }}
              onError={() => {
                console.log('WebView error');
                setIsLoading(false);
                setHasError(true);
              }}
              onLoad={() => {
                console.log('WebView loaded');
              }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 15,
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 50,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSubtext: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 50,
    padding: 30,
  },
  errorText: {
    color: Colors.white,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  errorButtons: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  externalButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SimpleVideoModal; 