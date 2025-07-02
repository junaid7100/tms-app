import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Linking, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import AppBar from "../src/components/AppBar";
import TakeControlSection from "../src/components/TakeControlSection";
import FAQSection from "../src/components/FAQSection";
import FloatingActionButton from "../src/components/FloatingActionButton";

// Import context
import { useScrollViewPadding } from "../src/context/BottomNavContext";

// Import hooks
import { useScreenAnimation } from "../src/hooks/useScreenAnimation";

// Import constants
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

const tmsCards = [
  {
    text: "You Or Your Loved One Has...\nSymptoms of depression or OCD that have not improved after attempts with medication.",
  },
  {
    text: "You Or Your Loved One Has...\nOutweighing the benefit of medication. With little to no side effects most TMS patients experience relief and show benefit in as little as 2-4 weeks.",
  },
  {
    text: "Your Quality Of Life Is...\nSuffering because of your depression, OCD, or other diagnosis.",
  },
];

const faqItems = [
  { question: "Is TMS Therapy Painful?", answer: "No, TMS therapy is generally not painful. Most patients describe a tapping or knocking sensation on their scalp during treatment. Some may experience mild discomfort that typically subsides after the first few sessions." },
  { question: "How Long Does a TMS Treatment Session Last?", answer: "A typical TMS treatment session lasts about 20-40 minutes. The full course of treatment usually involves 5 sessions per week for 4-6 weeks, totaling 20-30 sessions." },
  { question: "How Many TMS Sessions Will I Need?", answer: "Most patients undergo 20-30 sessions over 4-6 weeks. Your doctor will recommend a plan tailored to your needs." },
  { question: "Are There Any Side Effects of TMS Therapy?", answer: "TMS is well-tolerated. The most common side effect is mild scalp discomfort or headache, which usually resolves after a few sessions." },
  { question: "Can TMS Therapy Be Combined with Medication?", answer: "Yes, TMS therapy can be used alongside medication. Many patients continue their current medications during TMS treatment. Your doctor will provide guidance on your specific treatment plan." },
  { question: "How Soon Will I Notice Results from TMS Therapy?", answer: "Many patients notice improvement after 2-3 weeks of treatment, with benefits continuing to accrue throughout the course of therapy." },
];

/**
 * Treatment Screen Component
 */
export default function TreatmentScreen() {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const [isFeaturePressed, setIsFeaturePressed] = useState(false);
  
  // Use screen animation hook
  const { animatedStyle } = useScreenAnimation();

  const handleContact = () => router.push("/contact");

  return (
    <AppBar>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={scrollViewPadding}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={require("../assets/treatment-hero.png")} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Treatment</Text>
          </View>
        </View>

        {/* Section matching reference image */}
        <View style={styles.featureSection}>
          <Image source={require("../assets/treatment.png")} style={styles.featureImage} />
          <View style={styles.treatmentHeaderRow}>
            <View style={styles.treatmentHeaderLine} />
            <Text style={styles.treatmentHeading}>OUR TEAM</Text>
            <View style={styles.treatmentHeaderLine} />
          </View>
          <Text style={styles.featureTitle}><Text style={styles.featureTitleBlue}>Providing The Ultimate </Text><Text style={styles.featureTitleBlack}>TMS Treatment</Text></Text>
          <Text style={styles.featureDesc}>
            Where other treatments have failed, we offer an effective solution for treatment resistant Depression, OCD, and other mental health inhibitors, without the use of medication, side effects, or invasive procedures — using FDA approved, state-of-the-art technology that only Brain Ultimate provides.
          </Text>
          <TouchableOpacity 
            style={[
              styles.featureButton,
              isFeaturePressed && styles.featureButtonPressed
            ]} 
            onPress={handleContact}
            onPressIn={() => setIsFeaturePressed(true)}
            onPressOut={() => setIsFeaturePressed(false)}
            activeOpacity={1}
          >
            <Text style={[
              styles.featureButtonText,
              isFeaturePressed && styles.featureButtonTextPressed
            ]}>
              LEARN MORE
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={isFeaturePressed ? Colors.white : Colors.white} 
              style={styles.featureButtonIcon} 
            />
          </TouchableOpacity>
        </View>

        {/* TMS Therapy Is For You If... Section */}
        <View style={styles.tmsIfSection}>
          <Text style={styles.tmsIfTitle}>
            <Text style={styles.tmsIfTitleBlue}>TMS Therapy</Text>
            <Text style={styles.tmsIfTitleBlack}> Is For You If...</Text>
          </Text>
          <View style={styles.tmsCardsRow}>
            <LinearGradient colors={["#e3ecef", "#2c5264"]} style={styles.tmsCard} start={{x:0.5, y:0}} end={{x:0.5, y:1}}>
              <View style={styles.tmsCardLogoCircle}>
                <Image source={require("../assets/tms-logo.png")} style={styles.tmsCardLogo} />
              </View>
              <Text style={styles.tmsCardTitle}>You Or Your Loved One Has...</Text>
              <Text style={styles.tmsCardText}>Symptoms of depression or OCD that have not improved after attempts with medication.</Text>
            </LinearGradient>
            <LinearGradient colors={["#e3ecef", "#2c5264"]} style={styles.tmsCard} start={{x:0.5, y:0}} end={{x:0.5, y:1}}>
              <View style={styles.tmsCardLogoCircle}>
                <Image source={require("../assets/tms-logo.png")} style={styles.tmsCardLogo} />
              </View>
              <Text style={styles.tmsCardTitle}>You Or Your Loved One Has...</Text>
              <Text style={styles.tmsCardText}>Outweighing the benefit of medications. With little to no side effects most TMS patients experience relief and show benefit in as little as 2–4 weeks.</Text>
            </LinearGradient>
            <LinearGradient colors={["#e3ecef", "#2c5264"]} style={styles.tmsCard} start={{x:0.5, y:0}} end={{x:0.5, y:1}}>
              <View style={styles.tmsCardLogoCircle}>
                <Image source={require("../assets/tms-logo.png")} style={styles.tmsCardLogo} />
              </View>
              <Text style={styles.tmsCardTitle}>Your Quality Of Life Is...</Text>
              <Text style={styles.tmsCardText}>Suffering because of your depression, OCD, or other diagnosis.</Text>
            </LinearGradient>
          </View>
        </View>

        {/* FAQ Section */}
        <FAQSection faqItems={faqItems} style={styles.faqSectionCustom} />

        {/* Take Control Section */}
        <TakeControlSection onPress={handleContact} />


      </ScrollView>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      </Animated.View>
    </AppBar>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    height: 180,
    position: "relative",
    marginBottom: Layout.spacing.large,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.heroOverlay,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.large,
  },
  heroTitle: {
    fontSize: Fonts.sizes.xxlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.overlayText,
    letterSpacing: 1,
    textAlign: "left",
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  curveTransition: {
    width: "100%",
    height: 64,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    marginTop: -20,
    marginBottom: 0,
    zIndex: 1,
  },
  featureSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    paddingBottom: 24,
    padding: 24,
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  featureImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  treatmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  treatmentHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  treatmentHeading: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.medium,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  featureTitle: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: Layout.spacing.small,
    marginTop: 0,
  },
  featureTitleBlue: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
  },
  featureTitleBlack: {
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
  },
  featureDesc: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    marginTop: 0,
    lineHeight: 20,
    paddingHorizontal: 0,
  },
  featureButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.small,
  },
  featureButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    letterSpacing: 1,
    marginRight: 8,
  },
  featureButtonIcon: {
    marginLeft: 0,
  },
  featureButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  featureButtonTextPressed: {
    color: Colors.white,
  },
  tmsIfSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    padding: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tmsIfTitle: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    marginLeft: 0,
  },
  tmsIfTitleBlue: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
  },
  tmsIfTitleBlack: {
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
  },
  tmsCardsRow: {
    gap: 18,
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  tmsCard: {
    borderRadius: Layout.borderRadius.large,
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.small,
    paddingVertical: Layout.spacing.large,
    width: '100%',
    minHeight: 220,
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 0,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  tmsCardLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  tmsCardTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: Layout.spacing.small,
    marginTop: Layout.spacing.small,
    minHeight: 35,
  },
  tmsCardText: {
    color: Colors.white,
    fontSize: Fonts.sizes.medium,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: Fonts.weights.regular,
    flex: 1,
    textAlignVertical: 'top',
    paddingHorizontal: Layout.spacing.small,
  },
  tmsCardLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  faqSectionCustom: {
    marginTop: 0,
  },



});
