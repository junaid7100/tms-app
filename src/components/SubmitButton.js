import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TouchableButton from './TouchableButton';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import Fonts from '../constants/Fonts';

const SubmitButton = ({ 
  onPress, 
  title = "SUBMIT", 
  isPressed = false, 
  onPressIn, 
  onPressOut,
  isSubmitting = false,
  disabled = false,
  icon = "send",
  style = {} 
}) => {
  return (
    <TouchableButton
      style={[
        styles.submitButton,
        (isSubmitting || disabled) && styles.submitButtonDisabled,
        style
      ]}
      pressedStyle={styles.submitButtonPressed}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || isSubmitting}
      enablePressEffects={true}
      accessibility={{
        label: isSubmitting ? "Submitting..." : title,
        state: { disabled: disabled || isSubmitting }
      }}
    >
      <Text style={[
        styles.submitButtonText,
        (isSubmitting || disabled) && styles.submitButtonTextDisabled
      ]}>
        {isSubmitting ? "SUBMITTING..." : title}
      </Text>
      {!isSubmitting && (
        <Ionicons 
          name={icon} 
          size={18} 
          color={Colors.white} 
          style={styles.submitButtonIcon} 
        />
      )}
    </TouchableButton>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Layout.spacing.large,
    marginBottom: Layout.spacing.xlarge,
    minHeight: 48,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    letterSpacing: 1,
    marginRight: 8,
  },
  submitButtonIcon: {
    marginLeft: 0,
  },
  submitButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.darkGray,
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonTextDisabled: {
    color: Colors.white,
  },
});

export default SubmitButton; 