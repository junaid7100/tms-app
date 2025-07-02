import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Linking, Alert, AppState, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import AppBar from "../src/components/AppBar";
import TakeControlSection from "../src/components/TakeControlSection";
import FloatingActionButton from "../src/components/FloatingActionButton";

// Import context
import { useScrollViewPadding } from "../src/context/BottomNavContext";

// Import hooks
import { useResponsiveDimensions } from "../src/hooks/useResponsiveDimensions";
import { useScreenAnimation } from "../src/hooks/useScreenAnimation";

// Import constants
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

/**
 * New Patients Screen Component
 */
export default function NewPatientsScreen() {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const { window: { width: screenWidth } } = useResponsiveDimensions();
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const logoScrollRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const mainScrollRef = useRef(null);
  const formsRef = useRef(null);
  
  // Use screen animation hook
  const { animatedStyle } = useScreenAnimation();
  
  // Press state for buttons
  const [isCoveragePressed, setIsCoveragePressed] = useState(false);
  const [isFormCardPressed, setIsFormCardPressed] = useState({});
  const [isExpectPressed, setIsExpectPressed] = useState(false);
  const [isAssessmentPressed, setIsAssessmentPressed] = useState(false);
  const [isAppointmentPressed, setIsAppointmentPressed] = useState(false);
  const logos = [
    require("../assets/logo1.png"),
    require("../assets/logo2.png"),
    require("../assets/logo3.png"),
    require("../assets/logo4.png"),
    require("../assets/logo5.png"),
    require("../assets/logo6.png"),

    // Add more logos as needed
  ];

  // Function to scroll to the next logo - memoized to prevent unnecessary re-renders
  const scrollToNextLogo = useCallback(() => {
    if (logoScrollRef.current && logos.length > 0) {
      setActiveLogoIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % logos.length;
        logoScrollRef.current.scrollTo({
          x: nextIndex * screenWidth,
          animated: true
        });
        return nextIndex;
      });
    }
  }, [screenWidth, logos.length]);

  // Set up auto-scrolling with proper cleanup
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollIntervalRef.current = setInterval(() => {
        scrollToNextLogo();
      }, 3000); // Change slide every 3 seconds
    } else {
      // Clear interval when auto-scrolling is disabled
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isAutoScrolling]); // Removed activeLogoIndex dependency to prevent unnecessary re-renders

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, []);

  // Handle app state changes to pause/resume auto-scroll
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Pause auto-scrolling when app goes to background
        setIsAutoScrolling(false);
      } else if (nextAppState === 'active') {
        // Resume auto-scrolling when app becomes active
        setIsAutoScrolling(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle user interaction with the carousel - memoized for performance
  const handleCarouselTouchStart = useCallback(() => {
    setIsAutoScrolling(false);
  }, []);

  const handleCarouselTouchEnd = useCallback(() => {
    // Add a small delay before resuming auto-scroll to prevent immediate scrolling
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 1000);
  }, []);

  const handleOpenDocument = async (documentName) => {
    try {
      let url;
      if (documentName === 'pre-cert-med-list.pdf') {
        url = 'https://tmsofemeraldcoast.com/wp-content/uploads/2025/04/medlist-2025_Fillable.pdf';
      } else if (documentName === 'phq-9.pdf') {
        url = 'https://tmsofemeraldcoast.com/wp-content/uploads/2025/04/PHQ9_Fillable-1.pdf';
      } else if (documentName === 'patient-intake.pdf') {
        url = 'https://tmsofemeraldcoast.com/wp-content/uploads/2025/04/Patient-Demographic-Sheet_Fillable.pdf';
      } else {
        url = `https://tmsofemeraldcoast.com/documents/${documentName}`;
      }

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open the document. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the document. Please try again later.");
    }
  };

  const scrollToForms = () => {
    if (formsRef.current && mainScrollRef.current) {
      formsRef.current.measureLayout(
        mainScrollRef.current._component || mainScrollRef.current,
        (x, y) => {
          mainScrollRef.current.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  return (
    <AppBar>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <ScrollView contentContainerStyle={scrollViewPadding} ref={mainScrollRef}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image source={require("../assets/new-patient-hero.jpg")} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Start Your Journey With Us</Text>
            </View>
          </View>
          {/* What to Expect Section */}
          <View style={styles.stepsContainer}>
            <Text style={styles.expectHeading}>Welcome to TMS therapy</Text>
            
            {/* Welcome Description */}
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>
                We're glad you're considering TMS therapy. Here's everything you need to know to get started with your treatment journey.
              </Text>
              <Text style={styles.welcomeHeading}>
                <Text style={styles.welcomeHeadingStart}>Start</Text>
                <Text style={styles.welcomeHeadingRest}> Your Healing Journey</Text>
              </Text>
              <Text style={styles.welcomeText}>
                We will guide you through every step of your TMS therapy process. Follow these three simple steps to begin your treatment:
              </Text>
            </View>

            {/* Step 1 */}
            <View style={styles.stepCard}>
              <Image source={require("../assets/treatment.png")} style={styles.stepImage} resizeMode="cover" />
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumberRow}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={Colors.primary} 
                      style={styles.stepIcon} 
                    />
                    <Text style={styles.stepNumber}>Step 1:</Text>
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepTitle}>Pre-Screen Consultation & Patient Intake Forms</Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>
                  Easily book and complete the necessary forms to start your treatment journey. Our Pre-Screen Consultation, BDI, PHQ-9, and Patient Intake forms are designed to gather essential information, ensuring personalized and effective care. Fill them out at your convenience, and we'll guide you through the next steps toward healing.
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.stepButton,
                    isExpectPressed && styles.stepButtonPressed
                  ]}
                  onPress={scrollToForms}
                  onPressIn={() => setIsExpectPressed(true)}
                  onPressOut={() => setIsExpectPressed(false)}
                  activeOpacity={1}
                >
                  <Text style={[
                    styles.stepButtonText,
                    isExpectPressed && styles.stepButtonTextPressed
                  ]}>
                    ACCESS FORMS
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={18} 
                    color={isExpectPressed ? Colors.white : Colors.white} 
                    style={styles.stepButtonIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepCard}>
              <Image source={require("../assets/therapy.png")} style={styles.stepImage} resizeMode="cover" />
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumberRow}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={Colors.primary} 
                      style={styles.stepIcon} 
                    />
                    <Text style={styles.stepNumber}>Step 2:</Text>
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepTitle}>Pre-Assessment</Text>
                  </View>
                </View>
                <Text style={styles.stepSubheadingFirst}>Find Out If TMS Is Right For You</Text>
                <Text style={styles.stepDescription}>
                  Your Intake Coordinator will be the first person you speak with (whether in person or over the phone), and he or she will examine your history and explain various steps in the process.
                </Text>
                <Text style={styles.stepSubheading}>We Focus On Insurance So You Don't Have To.</Text>
                <Text style={styles.stepDescription}>
                  The majority of major insurance plans cover our procedures. Your Intake Coordinator will also clarify treatment cost choices, including reviewing typical insurance plan requirements with you.{'\n'}
                  We will work with your health insurance provider to assess benefits.
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.stepButton,
                    isAssessmentPressed && styles.stepButtonPressed
                  ]}
                  onPress={() => router.push('/contact')}
                  onPressIn={() => setIsAssessmentPressed(true)}
                  onPressOut={() => setIsAssessmentPressed(false)}
                  activeOpacity={1}
                >
                  <Text style={[
                    styles.stepButtonText,
                    isAssessmentPressed && styles.stepButtonTextPressed
                  ]}>
                    CONSULT NOW
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={18} 
                    color={isAssessmentPressed ? Colors.white : Colors.white} 
                    style={styles.stepButtonIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepCard}>
              <Image source={require("../assets/treatment-centre.png")} style={styles.stepImage} resizeMode="cover" />
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumberRow}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={Colors.primary} 
                      style={styles.stepIcon} 
                    />
                    <Text style={styles.stepNumber}>Step 3:</Text>
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepTitle}>First Appointment</Text>
                  </View>
                </View>
                <Text style={styles.stepSubheadingFirst}>A Treatment Specialized For You</Text>
                <Text style={styles.stepDescription}>
                  This appointment may require a little extra time, as the focus will be determining the appropriate magnet strength and coil position to ensure your treatment works effectively.
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.stepButton,
                    isAppointmentPressed && styles.stepButtonPressed
                  ]}
                  onPress={() => router.push('/contact')}
                  onPressIn={() => setIsAppointmentPressed(true)}
                  onPressOut={() => setIsAppointmentPressed(false)}
                  activeOpacity={1}
                >
                  <Text style={[
                    styles.stepButtonText,
                    isAppointmentPressed && styles.stepButtonTextPressed
                  ]}>
                    CONSULT NOW
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={18} 
                    color={isAppointmentPressed ? Colors.white : Colors.white} 
                    style={styles.stepButtonIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Forms Section */}
          <View style={styles.formsSection} ref={formsRef}>
            <View style={styles.formsHeaderContainer}>
              <View style={styles.formsHeaderRow}>
                <View style={styles.formsHeaderLine} />
                <Text style={styles.formsHeading}>PATIENT FORMS</Text>
                <View style={styles.formsHeaderLine} />
              </View>
              <Text style={styles.formsTitle}>Complete Your Required Forms</Text>
            </View>
            {[
              { title: 'Patient Intake Form', onPress: () => router.push('/patient-demographic-sheet') },
              { title: 'Med History', onPress: () => router.push('/medical-history') },
              { title: 'Pre Cert Med List', onPress: () => router.push('/pre-cert-med-list') },
              { title: 'BDI', onPress: () => router.push('/bdi') },
              { title: 'PHQ – 9', onPress: () => router.push('/phq-9') },
            ].map((item, idx) => (
              <LinearGradient
                key={item.title}
                colors={['#e8f4f8', '#d3e1e1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formCard}
              >
                <Text style={styles.formCardTitle}>{item.title}</Text>
                <TouchableOpacity 
                  style={[
                    styles.formCardButton,
                    isFormCardPressed[idx] && styles.formCardButtonPressed
                  ]} 
                  onPress={item.onPress}
                  onPressIn={() => setIsFormCardPressed(prev => ({ ...prev, [idx]: true }))}
                  onPressOut={() => setIsFormCardPressed(prev => ({ ...prev, [idx]: false }))}
                  activeOpacity={1}
                >
                  <Text style={[
                    styles.formCardButtonText,
                    isFormCardPressed[idx] && styles.formCardButtonTextPressed
                  ]}>
                    CLICK HERE
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={18} 
                    color={isFormCardPressed[idx] ? Colors.white : Colors.white} 
                    style={styles.formCardButtonIcon} 
                  />
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </View>

          {/* Coverage Section */}
          <View style={styles.coverageSection}>
            <Image source={require("../assets/insurance.png")} style={styles.coverageImage} resizeMode="cover" />
            <Text style={styles.coverageTitle}><Text style={styles.coverageTitleBlue}>We Accept A Variety Of </Text><Text style={styles.coverageTitleBlack}>Insurance Plans</Text></Text>
            <Text style={styles.coverageDesc}>
              At TMS of Emerald Coast, we believe that everyone deserves access to high-quality mental health care. We accept a wide range of insurance plans to make sure that TMS therapy is affordable and accessible for you. Our team will assist in verifying your coverage to ensure a seamless experience throughout your treatment journey.
            </Text>
            <TouchableOpacity 
              style={[
                styles.coverageButton,
                isCoveragePressed && styles.coverageButtonPressed
              ]}
              onPressIn={() => setIsCoveragePressed(true)}
              onPressOut={() => setIsCoveragePressed(false)}
              activeOpacity={1}
            >
              <Text style={[
                styles.coverageButtonText,
                isCoveragePressed && styles.coverageButtonTextPressed
              ]}>
                CONTACT US
              </Text>
            </TouchableOpacity>
          </View>
          {/* Logo Carousel Section */}
          <View style={styles.logoCarouselSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.logoCarouselContent}
              onScroll={useCallback((e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                setActiveLogoIndex(index);
              }, [screenWidth])}
              scrollEventThrottle={32} // Reduced frequency for better performance
              ref={logoScrollRef}
              onTouchStart={handleCarouselTouchStart}
              onTouchEnd={handleCarouselTouchEnd}
              onMomentumScrollEnd={handleCarouselTouchEnd}
              // Performance optimizations
              removeClippedSubviews={true}
              decelerationRate="fast"
              bounces={false}
              overScrollMode="never"
              nestedScrollEnabled={false}
            >
              {useMemo(() => 
                logos.map((logo, idx) => (
                  <View style={[styles.logoSlide, { width: screenWidth }]} key={idx}>
                    <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                  </View>
                )), [logos, screenWidth]
              )}
            </ScrollView>
            <View style={styles.logoDotsRow}>
              {useMemo(() => 
                logos.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.logoDot, activeLogoIndex === idx && styles.logoDotActive]}
                  />
                )), [logos.length, activeLogoIndex]
              )}
            </View>
          </View>

          {/* Take Control Section */}
          <TakeControlSection />

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.large,
  },
  title: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: Layout.spacing.large,
  },
  card: {
    backgroundColor: Colors.lightGray,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.large,
  },
  cardTitle: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: Layout.spacing.medium,
  },
  paragraph: {
    fontSize: Fonts.sizes.regular,
    lineHeight: 24,
    color: Colors.text,
  },
  bulletPoints: {
    marginTop: Layout.spacing.medium,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Layout.spacing.medium,
  },
  bulletText: {
    fontSize: Fonts.sizes.regular,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.regular,
    paddingHorizontal: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    alignSelf: "center",
    marginTop: Layout.spacing.medium,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
  },
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
    paddingLeft: Layout.spacing.xlarge,
    paddingTop: Layout.spacing.xxlarge,
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
  coverageSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    padding: Layout.spacing.large,
    paddingHorizontal: Layout.spacing.large,
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  coverageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.TEXT_SPACING,
  },
  coverageHeaderLine: {
    width: 36,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
    marginRight: 6,
    borderRadius: 1,
  },
  coverageHeading: {
    color: Colors.primary,
    fontWeight: Fonts.weights.regular,
    fontSize: Fonts.sizes.large,
    letterSpacing: 1,
    textAlign: 'left',
  },
  coverageTitle: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: Layout.spacing.small,
    marginTop: 0,
    paddingHorizontal: 0,
  },
  coverageTitleBlue: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
  },
  coverageTitleBlack: {
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
  },
  coverageDesc: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    marginTop: 0,
    lineHeight: 20,
    paddingHorizontal: 0,
  },
  coverageButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    alignSelf: 'flex-start',
    marginBottom: Layout.spacing.medium,
    marginLeft: 0,
  },
  coverageButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    letterSpacing: 1,
  },
  coverageButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  coverageButtonTextPressed: {
    color: Colors.white,
  },
  coverageImage: {
    width: '100%',
    height: 180,
    borderRadius: Layout.borderRadius.large,
    marginTop: 0,
    marginBottom: Layout.spacing.medium,
  },
  logoCarouselSection: {
    backgroundColor: Colors.primary,
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    paddingVertical: Layout.spacing.xxlarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCarouselContent: {
    alignItems: 'center',
  },
  logoSlide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 260,
    height: 80,
    marginHorizontal: Layout.spacing.medium,
  },
  logoDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.medium,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b8792',
    marginHorizontal: 4,
  },
  logoDotActive: {
    backgroundColor: Colors.white,
  },
  stepsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    paddingTop: Layout.spacing.large,
    paddingBottom: Layout.spacing.large,
    paddingHorizontal: Layout.spacing.medium,
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  expectHeading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: Spacing.TEXT_SPACING,
    marginLeft: 0,
    paddingHorizontal: 9,
  },
  expectSubheading: {
    color: Colors.text,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: Layout.spacing.large,
    marginTop: 0,
    marginLeft: 0,
    paddingHorizontal: 0,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.large,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    width: 'auto',
    justifyContent: 'center',
  },
  progressStep: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: Spacing.TEXT_SPACING,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepNumber: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
  },
  progressStepLabel: {
    color: Colors.text,
    fontSize: Fonts.sizes.regular,
    marginTop: 8,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    paddingTop: 20,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: 'hidden',
    width: '100%',
  },
  stepContent: {
    padding: Layout.spacing.large,
    paddingHorizontal: Layout.spacing.xlarge,
    alignItems: 'flex-start',
    width: '100%',
  },
  stepHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.medium,
    width: '100%',
  },
  stepNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.TEXT_SPACING,
  },
  stepIcon: {
    marginRight: 8,
  },
  stepNumber: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.xlarge,
    marginBottom: 0,
  },
  stepTitleContainer: {
    flex: 1,
    flexShrink: 1,
  },
  stepTitle: {
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.xlarge,
    marginBottom: Spacing.FORM_INTERNAL,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  stepSubheading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    marginBottom: Spacing.TEXT_SPACING,
    marginTop: Layout.spacing.medium,
    textAlign: 'left',
    width: '100%',
  },
  stepSubheadingFirst: {
    color: Colors.primary,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    marginBottom: Spacing.TEXT_SPACING,
    marginTop: Spacing.TEXT_SPACING,
    textAlign: 'left',
    width: '100%',
  },
  stepImage: {
    width: '90%',
    height: 160,
    borderRadius: Layout.borderRadius.large,
    alignSelf: 'center',
    marginHorizontal: Layout.spacing.medium,
  },
  stepImageContain: {
    width: '90%',
    height: 160,
    borderRadius: Layout.borderRadius.large,
    backgroundColor: '#f8f9fa',
    alignSelf: 'center',
    marginHorizontal: Layout.spacing.medium,
  },
  stepDescription: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    marginTop: 0,
    lineHeight: 20,
    width: '100%',
  },
  stepButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.TEXT_SPACING,
  },
  stepButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    letterSpacing: 1,
    marginRight: 8,
  },
  stepButtonIcon: {
    marginLeft: 0,
  },
  stepButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  stepButtonTextPressed: {
    color: Colors.white,
  },
  formsSection: {
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
    marginHorizontal: Layout.spacing.large,
    paddingHorizontal: 0,
  },
  formsHeaderContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.large,
    paddingHorizontal: 0,
  },
  formsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formsHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  formsHeading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: Layout.spacing.medium,
  },
  formsTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
    alignSelf: 'center',
  },
  formCard: {
    borderRadius: Layout.borderRadius.large,
    alignItems: 'center',
    paddingVertical: Layout.spacing.xxlarge,
    paddingHorizontal: Layout.spacing.xlarge,
    marginBottom: Layout.spacing.medium,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  formCardTitle: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.large,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.medium,
  },
  formCardButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  formCardButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    marginRight: 8,
    letterSpacing: 1,
  },
  formCardButtonPressed: {
    backgroundColor: Colors.secondary,
  },
  formCardButtonTextPressed: {
    color: Colors.white,
  },
  formCardButtonIcon: {
    marginLeft: 0,
  },
  welcomeTextContainer: {
    marginHorizontal: 0,
    marginBottom: Layout.spacing.xxlarge,
    alignItems: 'flex-start',
    paddingHorizontal: 7,
  },
  welcomeText: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    lineHeight: 20,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    paddingHorizontal: 7,
  },
  welcomeHeading: {
    textAlign: 'left',
    marginBottom: Layout.spacing.small,
    marginTop: Layout.spacing.medium,
    paddingHorizontal: 7,
  },
  welcomeHeadingStart: {
    color: Colors.black,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
  },
  welcomeHeadingRest: {
    color: Colors.black,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
  },
  treatmentImage: {
    width: '90%',
    height: 190,
    borderRadius: Layout.borderRadius.large,
    marginHorizontal: Layout.spacing.xxlarge,
    marginBottom: Layout.spacing.large,
    marginTop: 0,
    alignSelf: 'center',
  },
});



