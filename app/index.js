import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  ImageBackground,
  Platform,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

// Import components
import AppBar from "../src/components/AppBar";
import TakeControlSection from "../src/components/TakeControlSection";
import HeroImage from "../src/components/HeroImage";
import OptimizedImage from "../src/components/OptimizedImage";
import FAQSection from "../src/components/FAQSection";
import FloatingActionButton from "../src/components/FloatingActionButton";
import ModernDatePicker from "../src/components/ModernDatePicker";
import SimpleVideoModal from "../src/components/SimpleVideoModal"; // Simplest and most reliable
import SubmitButton from "../src/components/SubmitButton";
import TouchableButton from "../src/components/TouchableButton";

// Import context
import { useScrollViewPadding } from "../src/context/BottomNavContext";

// Import hooks
import { useResponsiveDimensions } from "../src/hooks/useResponsiveDimensions";
import { useFormReducer } from "../src/hooks/useFormReducer";
import { useScreenAnimation } from "../src/hooks/useScreenAnimation";

// Import constants
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

// Import utils
import { validateEmail } from "../src/utils/validation";

// Import services
import ContactEmailService from "../src/services/ContactEmailService";
import OfflineStorageService from "../src/services/OfflineStorageService";

// Constants
const FAQ_ITEMS = [
  {
    question: "Is TMS Therapy Painful?",
    answer: "No, TMS therapy is generally not painful. Most patients describe a tapping or knocking sensation on their scalp during treatment. Some may experience mild discomfort that typically subsides after the first few sessions.",
  },
  {
    question: "How Long Does TMS Treatment Session Last?",
    answer: "A typical TMS treatment session lasts about 20-40 minutes. The full course of treatment usually involves 5 sessions per week for 4-6 weeks, totaling 20-30 sessions.",
  },
  {
    question: "Are There Any Side Effects of TMS Therapy?",
    answer: "TMS is well-tolerated. The most common side effect is mild scalp discomfort or headache, which usually resolves after a few sessions.",
  },
  {
    question: "Will My Insurance Cover TMS?",
    answer: "Many insurance providers now cover TMS therapy for patients who have not responded to traditional depression treatments. Our staff will work with you to verify your coverage and explain any out-of-pocket costs.",
  },
  {
    question: "How Long Will The Effects of TMS Therapy Last?",
    answer: "The effects of TMS therapy can last for months to years. Some patients experience long-term relief after a single course of treatment, while others may benefit from occasional maintenance sessions.",
  },
  {
    question: "Can TMS Therapy Be Combined with Medication?",
    answer: "Yes, TMS therapy can be used alongside medication. In fact, many patients continue their current medications during TMS treatment. Your doctor will provide guidance on your specific treatment plan.",
  },
];

// Custom hooks
const usePulseAnimation = () => {
  const pulseAnim1 = useMemo(() => new Animated.Value(0), []);
  const pulseAnim2 = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const createPulseAnimation = (anim) => {
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(createPulseAnimation(pulseAnim1)).start();
    setTimeout(() => {
      Animated.loop(createPulseAnimation(pulseAnim2)).start();
    }, 1500);
  }, [pulseAnim1, pulseAnim2]);

  return { pulseAnim1, pulseAnim2 };
};

const useFormState = () => {
  const {
    fields,
    errors,
    pressedStates,
    setField,
    setError,
    clearError,
    clearAllErrors,
    resetForm,
    setPressedState,
  } = useFormReducer(
    {
      name: "",
      email: "",
      date: null,
      consultationType: "Consultation",
    },
    {
      name: "",
      email: "",
      date: "",
      consultationType: "",
    },
    {
      learnMore: false,
      contactForm: false,
    }
  );

  return {
    fields,
    errors,
    pressedStates,
    setField,
    setError,
    clearError,
    clearAllErrors,
    resetForm,
    setPressedState,
  };
};

/**
 * Home Screen Component - Enhanced with better UX and performance
 */
export default function HomeScreen() {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const { window: dimensions, isTablet, isMobile, isSmallDevice } = useResponsiveDimensions();

  // State management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [showConsultationOptions, setShowConsultationOptions] = useState(false);

  // Custom hooks
  const { pulseAnim1, pulseAnim2 } = usePulseAnimation();
  const { animatedStyle } = useScreenAnimation(400);
  const formState = useFormState();

  // Animation values
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];

  // Entrance animation
  useEffect(() => {
    if (fadeAnim._value !== 1) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  // Optimized refresh functionality
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      formState.clearAllErrors();
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh content.');
    } finally {
      setIsRefreshing(false);
    }
  }, [formState.clearAllErrors]);

  // Enhanced contact handlers with better error handling
  const handleCall = useCallback(() => {
    try {
      Linking.openURL("tel:850-254-9575");
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call. Please dial 850-254-9575 manually.');
    }
  }, []);

  const handleEmail = useCallback(() => {
    try {
      Linking.openURL("mailto:info@tmsofemeraldcoast.com");
    } catch (error) {
      Alert.alert('Error', 'Unable to open email. Please email info@tmsofemeraldcoast.com manually.');
    }
  }, []);

  const handleBBBBadgePress = useCallback(() => {
    try {
      Linking.openURL("https://www.bbb.org/us/fl/fort-walton-beach/profile/mental-health-services/tms-of-emerald-coast-0683-90100824/#sealclick");
    } catch (error) {
      Alert.alert('Error', 'Unable to open BBB page. Please visit our website for more information.');
    }
  }, []);

  // Enhanced form validation with better UX
  const validateForm = useCallback(() => {
    let valid = true;
    const newErrors = {};

    if (!formState.fields.name.trim()) {
      newErrors.name = "Please enter your name";
      valid = false;
    } else if (formState.fields.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      valid = false;
    }

    if (!formState.fields.date) {
      newErrors.date = "Please select your preferred date";
      valid = false;
    } else {
      // Validate that the selected date is not today or in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(formState.fields.date);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.date = "Please select a future date";
        valid = false;
      }
    }

    if (!formState.fields.email.trim()) {
      newErrors.email = "Please enter your email";
      valid = false;
    } else if (!validateEmail(formState.fields.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!formState.fields.consultationType || formState.fields.consultationType === "") {
      newErrors.consultationType = "Please select a consultation type";
      valid = false;
    }

    // Set all errors at once for better UX
    Object.keys(newErrors).forEach(key => formState.setError(key, newErrors[key]));
    Object.keys(formState.errors).forEach(key => {
      if (!newErrors[key]) formState.clearError(key);
    });

    return valid;
  }, [formState.fields, formState.errors, formState.setError, formState.clearError]);

  // Enhanced form submission with background email sending and immediate success feedback
  const handleContactSubmit = useCallback(async () => {
    if (!validateForm()) {
      // Haptic feedback for errors (if available)
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Haptics not available, continue silently
      }
      return;
    }

    // Check internet connectivity before submission
    const isOnline = await OfflineStorageService.isOnline();
    if (!isOnline) {
      Alert.alert(
        "No Internet Connection", 
        "Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the new ContactEmailService for background email sending
      const result = await ContactEmailService.handleContactFormSubmission(
        formState.fields,
        'Home Screen Form'
      );

             if (result.success) {
         // Success feedback with haptics if available
         try {
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         } catch (e) {
           // Haptics not available, continue silently
         }

        Alert.alert(
          "Thank You!",
          "Your information has been successfully sent. We will get back to you soon!",
          [{ text: "OK", style: "default" }]
        );

        formState.resetForm();
        setShowConsultationOptions(false);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert(
        "Error",
        `There was a problem submitting your information: ${error.message || 'Please try again or call us directly.'}`,
        [
          { text: "Try Again", style: "default" },
          { text: "Call Now", style: "default", onPress: handleCall }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formState, setShowConsultationOptions, handleCall]);

  // Enhanced navigation with loading states
  const handleLearnMore = useCallback(() => {
    try {
      router.push("/treatment");
    } catch (error) {
      Alert.alert('Error', 'Unable to navigate. Please try again.');
    }
  }, [router]);

  const handleWatchVideo = useCallback(() => {
    setIsVideoModalVisible(true);
  }, []);

  return (
    <AppBar>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animatedContainer,
            animatedStyle
          ]}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={scrollViewPadding}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <HeroImage
              source={require("../assets/home-hero.jpeg")}
              height={isMobile ? dimensions.height * 0.6 : isTablet ? 500 : 600}
              priority={true}
            >
              <View style={styles.heroOverlay}>
                <View style={[styles.heroContent, (isMobile || Platform.OS === 'ios') && { width: "100%" }]}>
                  <Text
                    style={[styles.heroTitle, styles.heroTitleMargin, isSmallDevice && { fontSize: 28 }]}
                    accessibilityRole="header"
                    accessibilityLevel={1}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    Discover Hope Without
                  </Text>
                  <Text
                    style={[styles.heroTitle, isSmallDevice && { fontSize: 28 }]}
                    accessibilityRole="header"
                    accessibilityLevel={1}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    Medication
                  </Text>

                  <TouchableOpacity
                    style={styles.bbbBadge}
                    onPress={handleBBBBadgePress}
                    accessibilityRole="button"
                    accessibilityLabel="Better Business Bureau Accredited Business"
                    accessibilityHint="Opens BBB profile in browser"
                  >
                    <OptimizedImage
                      source={require("../assets/bbb-badge.png")}
                      style={styles.bbbImageLarge}
                      resizeMode="contain"
                      priority={true}
                      lazy={false}
                      accessibilityLabel="Better Business Bureau Accredited Business Badge"
                    />
                  </TouchableOpacity>

                  <Text style={[styles.heroDescription, isSmallDevice && { fontSize: 14 }]}>
                    If you're feeling overwhelmed and tired of the side effects of medication – TMS (Transcranial Magnetic
                    Stimulation) offers a safe, non-invasive, FDA approved option for treating depression. At TMS of Emerald
                    Coast, our experienced team is here to help you find relief.
                  </Text>

                  {/* Buttons Row */}
                  <View style={styles.heroButtonsRow}>
                    <TouchableButton
                      style={styles.contactButton}
                      onPress={() => router.push("/contact")}
                      accessibility={{
                        label: "Contact Us"
                      }}
                    >
                      <Text style={styles.contactButtonText}>Contact Us</Text>
                    </TouchableButton>
                    <TouchableButton
                      style={styles.videoButton}
                      onPress={handleWatchVideo}
                      accessibility={{
                        label: "Watch Video"
                      }}
                    >
                      <Ionicons name="play-outline" size={16} color="white" style={styles.videoIcon} />
                      <Text style={styles.videoButtonText}>Watch Video</Text>
                    </TouchableButton>
                  </View>
                </View>
              </View>
            </HeroImage>

            {/* Enhanced Contact Form Section */}
            <View style={styles.heroFormWrapper}>
              <ImageBackground
                source={require("../assets/contact-hero.jpg")}
                style={styles.heroFormBackground}
                imageStyle={styles.heroFormBackgroundImage}
              >
                <Pressable
                  style={styles.heroFormSection}
                  onPress={() => {
                    formState.clearAllErrors();
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.heroFormTitle} numberOfLines={2} ellipsizeMode="tail">
                    Get In Touch With TMS Of Emerald Coast Today
                  </Text>

                  <TextInput
                    style={[styles.heroFormInput, formState.errors.name ? styles.heroFormInputError : null]}
                    placeholder="Your Name"
                    value={formState.fields.name}
                    onChangeText={(value) => formState.setField("name", value)}
                    placeholderTextColor="#bdbdbd"
                    onFocus={() => formState.clearError("name")}
                    accessibilityLabel="Your Name"
                    accessibilityHint="Enter your full name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={50}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      // Focus will move to next input automatically
                    }}
                  />
                  {formState.errors.name ? (
                    <View style={styles.heroFormErrorContainer}>
                      <Ionicons name="alert-circle" size={14} color={Colors.error} style={styles.heroFormErrorIcon} />
                      <Text style={styles.heroFormError}>{formState.errors.name}</Text>
                    </View>
                  ) : null}

                  <ModernDatePicker
                    value={formState.fields.date}
                    onDateChange={(date) => {
                      // Validate date for home form
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      const selectedDate = new Date(date);
                      selectedDate.setHours(0, 0, 0, 0);
                      
                      if (selectedDate <= today) {
                        formState.setError("date", "Please select a future date");
                        return;
                      }
                      
                      formState.setField("date", date);
                    }}
                    placeholder="Select Preferred Date"
                    error={formState.errors.date}
                    onFocus={() => formState.clearError("date")}
                    onBlur={() => formState.clearError("date")}
                    style={styles.heroFormDatePicker}
                    placeholderTextColor="#666"
                    textColor="#222"
                    minimumDate={new Date()} // Restrict to future dates
                    borderStyle="transparent"
                  />

                  <TextInput
                    style={[styles.heroFormInput, formState.errors.email ? styles.heroFormInputError : null]}
                    placeholder="Your Email"
                    value={formState.fields.email}
                    onChangeText={(value) => formState.setField("email", value)}
                    placeholderTextColor="#bdbdbd"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => formState.clearError("email")}
                    accessibilityLabel="Your Email"
                    accessibilityHint="Enter your email address"
                    maxLength={100}
                    returnKeyType="done"
                  />
                  {formState.errors.email ? (
                    <View style={styles.heroFormErrorContainer}>
                      <Ionicons name="alert-circle" size={14} color={Colors.error} style={styles.heroFormErrorIcon} />
                      <Text style={styles.heroFormError}>{formState.errors.email}</Text>
                    </View>
                  ) : null}

                  <TouchableButton
                    style={[styles.heroFormDropdown, formState.errors.consultationType ? styles.heroFormInputError : null]}
                    onPress={() => setShowConsultationOptions(!showConsultationOptions)}
                    onPressIn={() => formState.clearError("consultationType")}
                    accessibility={{
                      label: "Consultation Type",
                      hint: "Select type of consultation",
                      state: { expanded: showConsultationOptions }
                    }}
                  >
                    <Text style={styles.heroFormDropdownText}>{formState.fields.consultationType}</Text>
                    <Ionicons
                      name={showConsultationOptions ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#333"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableButton>

                  {showConsultationOptions && (
                    <View style={styles.heroFormDropdownOptions}>
                      {['Consultation', 'Family Counseling', 'Anxiety Disorder', 'Depression', 'TMS Treatment'].map(option => (
                        <TouchableButton
                          key={option}
                          style={styles.heroFormDropdownOption}
                          onPress={() => {
                            formState.setField("consultationType", option);
                            setShowConsultationOptions(false);
                          }}
                          accessibility={{
                            label: option
                          }}
                        >
                          <Text style={styles.heroFormDropdownOptionText}>{option}</Text>
                        </TouchableButton>
                      ))}
                    </View>
                  )}

                  {formState.errors.consultationType ? (
                    <View style={styles.heroFormErrorContainer}>
                      <Ionicons name="alert-circle" size={14} color={Colors.error} style={styles.heroFormErrorIcon} />
                      <Text style={styles.heroFormError}>{formState.errors.consultationType}</Text>
                    </View>
                  ) : null}

                  <SubmitButton
                    onPress={handleContactSubmit}
                    onPressIn={() => formState.setPressedState("contactForm", true)}
                    onPressOut={() => formState.setPressedState("contactForm", false)}
                    isPressed={formState.pressedStates.contactForm}
                    isSubmitting={isSubmitting}
                    disabled={isSubmitting}
                    title="CONTACT US"
                    icon="send"
                    style={styles.heroFormButtonOverride}
                  />
                </Pressable>
              </ImageBackground>
            </View>

            {/* Enhanced TMS Info Section */}
            <View style={styles.tmsInfoSection}>
              <OptimizedImage
                source={require("../assets/patient-image.png")}
                style={styles.tmsInfoImage}
                resizeMode="cover"
                lazy={false}
                priority={true}
                accessibilityLabel="Patient receiving TMS therapy treatment"
              />
              <Text
                style={styles.tmsInfoHeading}
                accessibilityRole="header"
                accessibilityLevel={2}
              >
                Be Part Of The <Text style={{ color: '#000000' }}>4 in 5</Text> Patients Experiencing Relief With TMS.
              </Text>
              <View style={styles.tmsInfoSubheadingRow}>
                <View style={styles.tmsInfoBullet} />
                <Text style={styles.tmsInfoSubheading}>Embracing the healing power of magnetic fields</Text>
              </View>
              <Text style={styles.tmsInfoText}>
                Transcranial Magnetic Stimulation (TMS) is a non-invasive procedure that uses magnetic fields to stimulate nerve cells in the brain. This innovative treatment has emerged as a promising solution for individuals struggling with various mental health conditions, particularly depression.
              </Text>
              <View style={styles.tmsInfoSubheadingRow2}>
                <View style={styles.tmsInfoBullet} />
                <Text style={styles.tmsInfoSubheading2}>How Does it Work?</Text>
              </View>
              <Text style={styles.tmsInfoText2}>
                TMS therapy works by using magnetic pulses to gently stimulate specific areas of the brain involved in mood regulation. These pulses help activate brain cells, which can improve symptoms of depression and other mental health conditions. The procedure is non-invasive, painless, and does not require medication.
              </Text>
              <View style={styles.tmsInfoButtonRow}>
                <TouchableButton
                  style={styles.tmsInfoButton}
                  pressedStyle={styles.tmsInfoButtonPressed}
                  onPress={handleLearnMore}
                  enablePressEffects={true}
                  accessibility={{
                    label: "Learn More about TMS"
                  }}
                >
                  <Text style={styles.tmsInfoButtonText}>
                    LEARN MORE
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={Colors.white}
                    style={styles.tmsInfoButtonIcon}
                  />
                </TouchableButton>
                <TouchableButton
                  style={styles.playButton}
                  onPress={handleWatchVideo}
                  accessibility={{
                    label: "Watch TMS Video"
                  }}
                >
                  <View style={styles.playButtonInner}>
                    <Ionicons name="play" size={20} color={Colors.white} />
                  </View>
                  <Animated.View 
                    style={[
                      styles.pulseRing,
                      {
                        opacity: pulseAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 0],
                        }),
                        transform: [{
                          scale: pulseAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.6],
                          }),
                        }],
                      },
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.pulseRing,
                      {
                        opacity: pulseAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 0],
                        }),
                        transform: [{
                          scale: pulseAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.6],
                          }),
                        }],
                      },
                    ]} 
                  />
                </TouchableButton>
              </View>
            </View>

            {/* Military TMS Section */}
            <View style={styles.militaryCardSection}>
              <View style={styles.militaryCard}>
                <OptimizedImage
                  source={require("../assets/treatment-hero.png")}
                  style={styles.militaryCardImage}
                  resizeMode="cover"
                  lazy={false}
                  priority={true}
                  accessibilityLabel="TMS treatment video thumbnail"
                />
                <Text
                  style={styles.militaryCardHeading}
                  accessibilityRole="header"
                  accessibilityLevel={2}
                >
                  Transcranial Magnetic Stimulation TMS
                </Text>
                <Text style={styles.militaryCardText}>
                  Therapy is increasingly being used to support military personnel, particularly in addressing conditions like Post-Traumatic Stress Disorder (PTSD), depression, and anxiety, which are common among veterans and active-duty members.
                </Text>
              </View>

              <Text
                style={styles.militarySectionHeading}
                accessibilityRole="header"
                accessibilityLevel={3}
              >
                How TMS Helps Military Personnel
              </Text>

              <View style={styles.militarySubheadingRow}>
                <View style={styles.militaryBullet} />
                <Text style={styles.militarySectionSubheading}>PTSD Treatment</Text>
              </View>
              <Text style={styles.militarySectionText}>
                TMS targets areas of the brain linked to emotional regulation and fear response, helping reduce PTSD symptoms such as flashbacks, hypervigilance, and mood instability.
              </Text>

              <View style={styles.militarySubheadingRow}>
                <View style={styles.militaryBullet} />
                <Text style={styles.militarySectionSubheading}>Depression Relief</Text>
              </View>
              <Text style={styles.militarySectionText}>
                Many military members experience treatment-resistant depression. TMS is an FDA-approved, non-invasive option that has shown effectiveness when traditional therapies fail.
              </Text>

              <View style={styles.militarySubheadingRow}>
                <View style={styles.militaryBullet} />
                <Text style={styles.militarySectionSubheading}>Traumatic Brain Injury (TBI) Support</Text>
              </View>
              <Text style={styles.militarySectionText}>
                Some research suggests TMS may help with cognitive function and mood regulation in those who have suffered mild TBI.
              </Text>

              <View style={styles.militarySubheadingRow}>
                <View style={styles.militaryBullet} />
                <Text style={styles.militarySectionSubheading}>Anxiety & Insomnia</Text>
              </View>
              <Text style={styles.militarySectionText}>
                TMS can regulate brain activity associated with anxiety disorders and sleep disturbances.
              </Text>

              <View style={styles.militarySubheadingRow}>
                <View style={styles.militaryBullet} />
                <Text style={styles.militarySectionSubheading}>Non-Medicated Solution</Text>
              </View>
              <Text style={styles.militarySectionText}>
                Many military personnel prefer non-drug treatments to avoid side effects and dependency issues associated with medications.
              </Text>

              <Text
                style={styles.militarySectionHeading2}
                accessibilityRole="header"
                accessibilityLevel={3}
              >
                Why Military Personnel Benefit From TMS
              </Text>
              <View style={styles.militarySectionList}>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>Non-invasive & drug-free</Text>
                </View>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>Minimal side effects (usually mild headaches or scalp discomfort)</Text>
                </View>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>Quick sessions (typically 20-40 minutes per session, 5 days a week for 4-6 weeks)</Text>
                </View>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>Long-term effect: Studies suggest benefits last for months after treatment.</Text>
                </View>
              </View>

              <Text
                style={styles.militarySectionHeading2}
                accessibilityRole="header"
                accessibilityLevel={3}
              >
                Availability & Military Coverage
              </Text>
              <View style={styles.militarySectionList}>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>The U.S. Department of Veterans Affairs (VA) has been integrating TMS into PTSD and depression treatment programs.</Text>
                </View>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>TRICARE (military health insurance) and the VA may cover TMS therapy for qualifying service members and veterans.</Text>
                </View>
                <View style={styles.militaryListItemRow}>
                  <View style={styles.militaryListBullet} />
                  <Text style={styles.militarySectionListItem}>Some private clinics also offer TMS specifically for veterans.</Text>
                </View>
              </View>
            </View>

            {/* FAQ Section */}
            <FAQSection faqItems={FAQ_ITEMS} />

            {/* Take Control Section */}
            <TakeControlSection
              imageSource={require("../assets/device.png")}
            />

          </ScrollView>
        </Animated.View>

        {/* Floating Action Button */}
        <FloatingActionButton />

        {/* Video Modal */}
        <SimpleVideoModal
          visible={isVideoModalVisible}
          onClose={() => setIsVideoModalVisible(false)}
          videoUri="https://tmsofemeraldcoast.com/wp-content/uploads/2025/05/TMSMilitaryNew.m4v"
          title="TMS Military Treatment Information"
        />
      </View>
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
  heroOverlay: {
    backgroundColor: Colors.heroOverlay,
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.large,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    width: "50%",
    marginTop: 24,
  },
  heroTitleMargin: {
    marginBottom: 0,
  },
  heroTitle: {
    color: Colors.overlayText,
    fontSize: 44,
    fontWeight: Fonts.weights.bold,
    marginBottom: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bbbBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: -16,
  },
  bbbImageLarge: {
    width: 160,
    height: 160,
    marginBottom: 0,
    paddingBottom: 0,
  },
  heroDescription: {
    color: Colors.white,
    fontSize: 16, // Increased from Fonts.sizes.regular (16) to 18
    lineHeight: 24, // Increased line height to match the new font size
    marginBottom: 30,
    marginTop: -32,
    paddingTop: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 9,
    paddingHorizontal: Layout.spacing.large,
    borderRadius: Layout.borderRadius.medium,
    alignSelf: 'flex-start',
    marginRight: 12,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: Layout.spacing.large,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.transparent,
  },
  videoIcon: {
    marginRight: 6,
  },
  videoButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
  },
  heroFormWrapper: {
    marginHorizontal: Layout.spacing.large,
    marginTop: Spacing.HERO_TO_SECTION, // 32px from hero
    marginBottom: Spacing.SECTION_TO_SECTION, // 50px to next section
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  heroFormBackground: {
    width: '100%',
  },
  heroFormBackgroundImage: {
    borderRadius: Layout.borderRadius.large,
    resizeMode: 'cover',
  },
  heroFormSection: {
    backgroundColor: Colors.formBackground,
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  heroFormTitle: {
    color: Colors.white,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: Layout.spacing.medium,
    width: '100%',
    flexShrink: 1,
    lineHeight: 26,
  },
  heroFormTitleSecond: {
    color: Colors.white,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    textAlign: 'left',
    marginBottom: Layout.spacing.medium,
    marginTop: 0,
  },
  heroFormInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: Fonts.sizes.regular,
    marginBottom: 16,
  },
  heroFormDatePicker: {
    marginBottom: 16,
  },
  heroFormInputError: {
    borderColor: Colors.error,
  },
  heroFormDropdown: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroFormDropdownText: {
    fontSize: Fonts.sizes.regular,
    color: '#222',
  },
  heroFormDropdownOptions: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: 18,
    overflow: 'hidden',
  },
  heroFormDropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  heroFormDropdownOptionText: {
    fontSize: Fonts.sizes.medium,
    color: '#222',
  },
  heroFormButtonOverride: {
    backgroundColor: Colors.secondary,
    marginTop: 20,
    marginBottom: 0,
  },
  heroFormErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  heroFormErrorIcon: {
    marginRight: 6,
  },
  heroFormError: {
    color: Colors.error,
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.medium,
    flex: 1,
  },
  heroFormErrorText: {
    color: Colors.error,
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.medium,
    flex: 1,
  },
  tmsInfoSection: {
    backgroundColor: '#e8f4f8',
    borderRadius: 0,
    padding: 24,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
  },
  tmsInfoHeading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    marginBottom: Layout.spacing.small,
    textAlign: 'left',
  },
  tmsInfoSubheadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tmsInfoBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  tmsInfoSubheading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    marginBottom: 0,
    textAlign: 'left',
  },
  tmsInfoText: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    marginBottom: 10,
    textAlign: 'left',
  },
  tmsInfoText2: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    marginBottom: 18,
    textAlign: 'left',
  },
  tmsInfoButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  tmsInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    alignSelf: 'flex-start',
  },
  tmsInfoButtonText: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    marginRight: 8,
  },
  tmsInfoButtonIcon: {
    marginLeft: 0,
  },
  tmsInfoButtonPressed: {
    backgroundColor: Colors.secondary,
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
  },
  tmsInfoButtonTextPressed: {
    color: Colors.white,
  },
  tmsInfoImage: {
    width: '100%',
    height: 180,
    borderRadius: Layout.borderRadius.large,
    marginTop: 0,
    marginBottom: 18,
  },
  militaryCardSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    padding: Layout.spacing.large,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
    paddingHorizontal: 0,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  militaryCard: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    marginHorizontal: 0,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  militaryCardHeading: {
    color: Colors.white,
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    marginBottom: Spacing.TEXT_SPACING,
    textAlign: 'left',
  },
  militaryCardText: {
    color: Colors.white,
    fontSize: Fonts.sizes.medium,
    marginBottom: 12,
    textAlign: 'left',
  },
  militaryCardImage: {
    width: '100%',
    height: 170,
    borderRadius: Layout.borderRadius.large,
    marginTop: 0,
    marginBottom: 18,
  },
  militarySectionHeading: {
    color: Colors.primary,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    marginBottom: Spacing.TEXT_SPACING,
    marginTop: Spacing.TEXT_SPACING,
    paddingHorizontal: Layout.spacing.xlarge,
    textAlign: 'left',
  },
  militarySectionHeading2: {
    color: Colors.primary,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    marginTop: Layout.spacing.medium,
    marginBottom: Spacing.TEXT_SPACING,
    paddingHorizontal: Layout.spacing.xlarge,
    textAlign: 'left',
  },
  militarySectionSubheading: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.regular,
    marginBottom: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    textAlign: 'left',
  },
  militarySectionText: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    marginBottom: 2,
    paddingHorizontal: Layout.spacing.xlarge,
    textAlign: 'left',
  },
  militarySectionList: {
    paddingHorizontal: Layout.spacing.xlarge,
    paddingLeft: Layout.spacing.xxlarge,
    marginBottom: 8,
  },
  militarySectionListItem: {
    color: Colors.text,
    fontSize: Fonts.sizes.medium,
    marginBottom: 0,
    textAlign: 'left',
    flex: 1,
  },
  tmsInfoSubheadingRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tmsInfoSubheading2: {
    color: Colors.primary,
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    marginBottom: 0,
    textAlign: 'left',
  },
  militarySubheadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  militaryBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  militaryListItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  militaryListBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 10,
    marginTop: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginLeft: 8,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.secondary,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
