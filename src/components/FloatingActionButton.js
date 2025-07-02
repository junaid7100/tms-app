import React, { useState } from 'react';
import { StyleSheet, View, Animated, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TouchableButton from './TouchableButton';

// Import constants
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

/**
 * Floating Action Button Component
 * Provides quick access to contact options
 */
const FloatingActionButton = ({ style = {} }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleCall = async () => {
    try {
      await Linking.openURL("tel:850-254-9575");
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call. Please dial 850-254-9575 manually.');
    }
    setIsExpanded(false);
  };

  const handleEmail = async () => {
    try {
      await Linking.openURL("mailto:info@tmsofemeraldcoast.com");
    } catch (error) {
      Alert.alert('Error', 'Unable to open email. Please email info@tmsofemeraldcoast.com manually.');
    }
    setIsExpanded(false);
  };

  const handleContact = () => {
    try {
      router.push("/contact");
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate to contact page.');
    }
    setIsExpanded(false);
  };

  const actionButtons = [
    {
      icon: 'call',
      color: Colors.success,
      onPress: handleCall,
      label: 'Call',
      index: 0,
    },
    {
      icon: 'mail',
      color: Colors.primary,
      onPress: handleEmail,
      label: 'Email',
      index: 1,
    },
    {
      icon: 'chatbubble',
      color: Colors.secondary,
      onPress: handleContact,
      label: 'Contact',
      index: 2,
    },
  ];

  const renderActionButton = (action) => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 * (action.index + 1))],
    });

    const opacity = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    const scale = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <Animated.View
        key={action.icon}
        style={[
          styles.actionButton,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <TouchableButton
          style={[styles.actionButtonTouchable, { backgroundColor: action.color }]}
          onPress={action.onPress}
          accessibility={{
            label: action.label
          }}
        >
          <Ionicons name={action.icon} size={20} color={Colors.white} />
        </TouchableButton>
      </Animated.View>
    );
  };

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {/* Action Buttons */}
      {actionButtons.map(renderActionButton)}
      
      {/* Main FAB */}
      <Animated.View
        style={[
          styles.mainButton,
          {
            transform: [{ rotate: mainButtonRotation }],
          },
        ]}
      >
        <TouchableButton
          style={styles.mainButtonTouchable}
          onPress={toggleExpanded}
          accessibility={{
            label: isExpanded ? "Close contact options" : "Open contact options",
            state: { expanded: isExpanded }
          }}
        >
          <Ionicons 
            name={isExpanded ? "close" : "add"} 
            size={24} 
            color={Colors.white} 
          />
        </TouchableButton>
      </Animated.View>
      
      {/* Backdrop */}
      {isExpanded && (
        <TouchableButton
          style={styles.backdrop}
          onPress={toggleExpanded}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton; 