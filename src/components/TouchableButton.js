import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

/**
 * Reusable TouchableButton Component
 * Provides consistent touch feedback across all buttons in the app
 * 
 * @param {Object} props
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Function} props.onPressIn - Function to call when press starts
 * @param {Function} props.onPressOut - Function to call when press ends
 * @param {Array|Object} props.style - Button style(s)
 * @param {Array|Object} props.pressedStyle - Style(s) to apply when button is pressed
 * @param {number} props.activeOpacity - Opacity when pressed (default: 0.7)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.enablePressEffects - Enable scale and shadow effects (default: false)
 * @param {number} props.pressScale - Scale factor when pressed (default: 0.98)
 * @param {Object} props.accessibility - Accessibility props (role, label, hint, state)
 * @param {ReactNode} props.children - Button content
 */
const TouchableButton = ({
  onPress,
  onPressIn,
  onPressOut,
  style = {},
  pressedStyle = {},
  activeOpacity = 0.7,
  disabled = false,
  enablePressEffects = false,
  pressScale = 0.98,
  accessibility = {},
  children,
  ...restProps
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    if (onPressIn) onPressIn();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (onPressOut) onPressOut();
  };

  const getButtonStyle = () => {
    const baseStyle = Array.isArray(style) ? style : [style];
    
    if (isPressed) {
      const pressed = Array.isArray(pressedStyle) ? pressedStyle : [pressedStyle];
      
      if (enablePressEffects) {
        const effectsStyle = {
          transform: [{ scale: pressScale }],
          shadowOpacity: 0.05,
        };
        return [...baseStyle, ...pressed, effectsStyle];
      }
      
      return [...baseStyle, ...pressed];
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      disabled={disabled}
      accessibilityRole={accessibility.role || "button"}
      accessibilityLabel={accessibility.label}
      accessibilityHint={accessibility.hint}
      accessibilityState={accessibility.state}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

export default TouchableButton; 