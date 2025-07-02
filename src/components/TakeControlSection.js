import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import OptimizedImage from './OptimizedImage';
import TouchableButton from './TouchableButton';

// Import constants
import Colors from '../constants/Colors';
import Fonts from '../constants/Fonts';
import Layout from '../constants/Layout';
import Spacing from '../constants/Spacing';

/**
 * Reusable Take Control Section Component
 * Used across multiple screens for consistent CTA section
 */
const TakeControlSection = ({ 
  title = "Take Control Of",
  subtitle = "Your Depression",
  description = "Reclaim your life with TMS therapy. Schedule a consultation with our experienced team at TMS of Emerald Coast to discuss your treatment options and start your journey to recovery.",
  buttonText = "CONTACT US",
  onPress,
  imageSource = require("../../assets/depression.png"),
  style = {}
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/contact");
    }
  };

  return (
    <View style={[styles.takeControlSection, style]}>
      <View style={styles.takeControlImageWrapper}>
        <OptimizedImage 
          source={imageSource} 
          style={styles.takeControlImage} 
          resizeMode="cover"
          lazy={true}
          priority={false}
        />
      </View>
      <Text style={styles.takeControlTitle}>{title}</Text>
      <Text style={styles.takeControlSubtitle}>{subtitle}</Text>
      <Text style={styles.takeControlText}>{description}</Text>
      <TouchableButton 
        style={styles.takeControlButton}
        pressedStyle={styles.takeControlButtonPressed}
        onPress={handlePress}
        enablePressEffects={true}
        accessibility={{
          label: buttonText
        }}
      >
        <Text style={styles.takeControlButtonText}>
          {buttonText}
        </Text>
        <Ionicons 
          name="arrow-forward" 
          size={18} 
          color={Colors.white} 
          style={styles.takeControlButtonIcon} 
        />
      </TouchableButton>
    </View>
  );
};

const styles = StyleSheet.create({
  takeControlSection: {
    backgroundColor: '#f0f3f4',
    borderRadius: 0,
    padding: 24,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
    alignItems: 'flex-start',
  },
  takeControlTitle: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: 0,
  },
  takeControlSubtitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: 18,
    marginTop: 0,
  },
  takeControlText: {
    color: Colors.text,
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 24,
    marginHorizontal: 0,
  },
  takeControlButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 0,
    marginTop: 0,
  },
  takeControlButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: 15,
    marginRight: 8,
  },
  takeControlButtonIcon: {
    marginLeft: 0,
  },
  takeControlButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  takeControlImageWrapper: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: Layout.borderRadius.large,
    alignItems: 'flex-start',
    marginTop: 0,
    marginBottom: 18,
  },
  takeControlImage: {
    width: '100%',
    height: 140,
    borderRadius: Layout.borderRadius.large,
  },
});

export default TakeControlSection; 