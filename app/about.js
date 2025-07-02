import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Linking, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppBar from "../src/components/AppBar";
import TakeControlSection from "../src/components/TakeControlSection";
import HeroImage from "../src/components/HeroImage";
import OptimizedImage from "../src/components/OptimizedImage";
import FloatingActionButton from "../src/components/FloatingActionButton";
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

// Import context
import { useScrollViewPadding } from "../src/context/BottomNavContext";
import { preloadScreenImages } from "../src/utils/imageCache";

// Import hooks
import { useScreenAnimation } from "../src/hooks/useScreenAnimation";

/**
 * About Screen Component
 */
export default function AboutScreen() {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const [isCtaPressed, setIsCtaPressed] = useState(false);
  
  // Use screen animation hook
  const { animatedStyle } = useScreenAnimation();

  // Preload screen images on component mount
  useEffect(() => {
    preloadScreenImages('about');
  }, []);

  const handleContact = () => {
    router.push("/contact");
  };

  const teamMembers = [
    {
      name: "MINDY MCCLELLAN",
      role: "Director of Clinical Services, Certified Clinician",
      image: require("../assets/expert1.png"),
    },
    {
      name: "CORNELIUS ALBERT",
      role: "Director of Marketing, Certified Clinician",
      image: require("../assets/expert2.png"),
    },
    {
      name: "DR. VICTOR DE MOYA, MD",
      role: "Medical Director",
      image: require("../assets/expert3.png"),
    },
    {
      name: "DR. JAMES IGLEBURGER, MD",
      role: "Medical Advisor",
      image: require("../assets/expert4.png"),
    },
  ];

  return (
    <AppBar>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <ScrollView contentContainerStyle={scrollViewPadding}>
          {/* Hero Section */}
          <HeroImage 
            source={require("../assets/about-hero.jpg")}
            height={180}
            priority={true}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>About Us</Text>
            </View>
          </HeroImage>

          {/* About Us Section */}
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeaderRow}>
              <View style={styles.aboutHeaderLine} />
              <Text style={styles.aboutHeading}>ABOUT US</Text>
            </View>
            <Text style={styles.aboutTitle}>Dedicated To Finding{"\n"}Effective Solutions</Text>
            <Text style={styles.aboutText}>
              At TMS of Emerald Coast, we are dedicated to helping individuals achieve their highest level of happiness, recovery, and peace of mind. Through advanced Transcranial Magnetic Stimulation (TMS) protocols, our team of medical and clinical professionals is here to provide a safe, effective, and non-invasive treatment for those who have not responded to other forms of therapy or medication. We are deeply committed to offering genuine hope, innovative treatment, and a supportive environment.
            </Text>
            <Text style={styles.aboutText}>
              The reality is that depression and several other mental health conditions can be resistant to traditional treatments. We believe that everyone deserves a chance at recovery, and we are here to help you reclaim your life.
            </Text>
            <View style={styles.conditionsRow}>
              {["Depression", "Anxiety", "PTSD", "OCD"].map((item) => (
                <View key={item} style={styles.conditionItem}>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                  <Text style={styles.conditionText}>{item}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity 
              style={[
                styles.ctaButton,
                isCtaPressed && styles.ctaButtonPressed
              ]} 
              onPress={handleContact}
              onPressIn={() => setIsCtaPressed(true)}
              onPressOut={() => setIsCtaPressed(false)}
              activeOpacity={1}
            >
              <Text style={[
                styles.ctaButtonText,
                isCtaPressed && styles.ctaButtonTextPressed
              ]}>
                CONTACT US
              </Text>
            </TouchableOpacity>
          </View>

          {/* Team Section */}
          <View style={styles.teamSection}>
            <View style={styles.teamHeaderRow}>
              <View style={styles.teamHeaderLine} />
              <Text style={styles.teamHeading}>OUR TEAM</Text>
              <View style={styles.teamHeaderLine} />
            </View>
            <Text style={styles.teamTitle}>
              Meet <Text style={styles.teamTitleBold}>Our</Text> Expert
            </Text>
            <View style={styles.teamGrid}>
              {teamMembers.map((member) => (
                <View key={member.name} style={styles.teamCard}>
                  <OptimizedImage 
                    source={member.image} 
                    style={styles.teamImage}
                    resizeMode="cover"
                    lazy={true}
                    priority={false}
                  />
                  <View style={styles.teamTextContainer}>
                    <Text style={styles.teamName}>{member.name}</Text>
                    <Text style={styles.teamRole}>{member.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Call to Action Card */}
          <TakeControlSection onPress={handleContact} />


        </ScrollView>
        
        {/* Floating Action Button */}
        <FloatingActionButton />
        </Animated.View>
      </SafeAreaView>
    </AppBar>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  aboutSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    borderRadius: 0,
    padding: 24,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  aboutHeaderLine: {
    width: 36,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
    marginRight: 6,
    borderRadius: 1,
  },
  aboutHeading: {
    color: Colors.primary,
    fontWeight: Fonts.weights.regular,
    fontSize: Fonts.sizes.large,
    letterSpacing: 1,
    textAlign: 'left',
  },
  aboutTitle: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: Layout.spacing.medium,
    textAlign: 'left',
  },
  aboutText: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    marginBottom: Layout.spacing.small,
    lineHeight: 20,
    textAlign: 'left',
  },
  conditionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: Layout.spacing.large,
    flexWrap: "wrap",
    gap: 10,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 6,
  },
  checkCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  conditionText: {
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
    fontSize: Fonts.sizes.medium,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
    marginTop: Layout.spacing.medium,
  },
  ctaButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    letterSpacing: 1,
  },
  ctaButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  ctaButtonTextPressed: {
    color: Colors.white,
  },
  teamSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    paddingHorizontal: Layout.spacing.medium,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  teamHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  teamHeading: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.medium,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  teamTitle: {
    fontSize: Fonts.sizes.xxlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: Layout.spacing.xlarge,
    textAlign: 'center',
  },
  teamTitleBold: {
    color: Colors.black,
    fontWeight: Fonts.weights.bold,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    backgroundColor: '#e6ece9',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    padding: 0,
    width: '48%',
    height: 250,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  teamImage: {
    width: '100%',
    height: 165,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    resizeMode: 'cover',
  },
  teamTextContainer: {
    padding: 8,
  },
  teamName: {
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.medium,
    color: Colors.black,
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  teamRole: {
    color: Colors.text,
    fontSize: Fonts.sizes.small,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 4,
    marginTop: 0,
  },


});


