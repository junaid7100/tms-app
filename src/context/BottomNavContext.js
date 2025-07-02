import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Context for managing bottom navigation height across the app
 */
const BottomNavContext = createContext({
  bottomNavHeight: Platform.OS === 'ios' ? 85 : 70, // Platform-specific default
  setBottomNavHeight: () => {},
});

/**
 * Provider component for bottom navigation context
 */
export const BottomNavProvider = ({ children }) => {
  const [bottomNavHeight, setBottomNavHeight] = useState(Platform.OS === 'ios' ? 85 : 70);

  return (
    <BottomNavContext.Provider value={{ bottomNavHeight, setBottomNavHeight }}>
      {children}
    </BottomNavContext.Provider>
  );
};

/**
 * Hook to access bottom navigation height
 */
export const useBottomNavContext = () => {
  const context = useContext(BottomNavContext);
  if (!context) {
    throw new Error('useBottomNavContext must be used within a BottomNavProvider');
  }
  return context;
};

/**
 * Hook to get the safe padding bottom for ScrollView content
 * This ensures content doesn't get hidden behind the bottom navigation
 */
export const useScrollViewPadding = () => {
  const { bottomNavHeight } = useBottomNavContext();

  // No padding at all
  const paddingBottom = 0;

  return { paddingBottom };
};
