import { useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Custom hook for screen entrance animations
 * Provides smooth fade animation for transitions
 */
export const useScreenAnimation = (duration = 400) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Smooth fade-in animation with easing
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard easing
    }).start();
  }, [fadeAnim, duration]);

  // Return animation styles
  const animatedStyle = { opacity: fadeAnim };

  return {
    animatedStyle,
    fadeAnim,
  };
};

/**
 * Simple fade-only hook for therapeutic, calming transitions
 * Perfect for medical apps where subtle animations are preferred
 */
export const useFadeAnimation = (duration = 400) => {
  return useScreenAnimation(duration);
}; 