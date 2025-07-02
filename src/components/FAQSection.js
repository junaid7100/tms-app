import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import hooks
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

// Import constants
import Colors from '../constants/Colors';
import Fonts from '../constants/Fonts';
import Layout from '../constants/Layout';
import Spacing from '../constants/Spacing';

/**
 * Reusable FAQ Section Component
 * Used across multiple screens for consistent FAQ display
 */
const FAQSection = ({ 
  faqItems = [],
  headerText = "FAQ'S",
  title = "Frequently Asked Questions",
  titlePrimaryText = "Frequently Asked ",
  titleBlackText = "Questions",
  showHeader = true,
  style = {}
}) => {
  const { isSmallDevice } = useResponsiveDimensions();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = useCallback((index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  }, [expandedFaq]);

  return (
    <View style={[styles.faqSection, style]}>
      {showHeader && (
        <View style={styles.faqHeaderContainer}>
          <View style={styles.faqHeaderLine} />
          <Text style={styles.faqHeaderText}>{headerText}</Text>
          <View style={styles.faqHeaderLine} />
        </View>
      )}
      
      <Text style={[styles.faqTitle, isSmallDevice && { fontSize: 28 }]}>
        <Text style={styles.faqTitlePrimary}>{titlePrimaryText}</Text>
        <Text style={styles.faqTitleBlack}>{titleBlackText}</Text>
      </Text>

      {faqItems.map((item, index) => (
        <Pressable
          key={index}
          style={[styles.faqItem, expandedFaq === index && styles.faqItemExpanded]}
          onPress={() => toggleFaq(index)}
        >
          <View style={styles.faqQuestion}>
            <Text style={[styles.faqQuestionText, isSmallDevice && { fontSize: 14 }]}>
              {item.question}
            </Text>
            <Ionicons 
              name={expandedFaq === index ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={Colors.primary} 
            />
          </View>
          {expandedFaq === index && (
            <Text style={[styles.faqAnswerText, isSmallDevice && { fontSize: 14 }]}>
              {item.answer}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  faqSection: {
    paddingTop: Layout.spacing.xlarge,
    paddingBottom: Layout.spacing.xlarge,
    paddingHorizontal: Layout.spacing.large,
    backgroundColor: Colors.lightGray,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
  },
  faqHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  faqHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    marginHorizontal: 25,
  },
  faqHeaderText: {
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    letterSpacing: 2,
    paddingHorizontal: 2,
  },
  faqTitle: {
    fontSize: 28,
    fontWeight: Fonts.weights.bold,
    marginBottom: 30,
    textAlign: "center",
  },
  faqTitlePrimary: {
    color: Colors.primary,
  },
  faqTitleBlack: {
    color: Colors.black,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  faqItemExpanded: {
    borderColor: Colors.primary,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
  },
  faqQuestionText: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.medium,
    color: Colors.primary,
    flex: 1,
  },
  faqAnswerText: {
    fontSize: Fonts.sizes.medium,
    lineHeight: 20,
    color: Colors.darkGray,
    padding: 15,
  },
});

export default FAQSection; 