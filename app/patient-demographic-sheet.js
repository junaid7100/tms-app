import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";

// Import components
import AppBar from "../src/components/AppBar";
import ModernDatePicker from "../src/components/ModernDatePicker";
import SubmitButton from "../src/components/SubmitButton";
import LoadingOverlay from "../src/components/LoadingOverlay";
import SuccessModal from "../src/components/SuccessModal";

// Import context
import { useScrollViewPadding } from "../src/context/BottomNavContext";

// Import hooks
import { useScreenAnimation } from "../src/hooks/useScreenAnimation";

// Import services
import FormSubmissionService from "../src/services/FormSubmissionService";
import PatientSessionService from "../src/services/PatientSessionService";
import ValidationService from '../src/services/ValidationService';
import OfflineStorageService from '../src/services/OfflineStorageService';

// Import validation
import { PatientIntakeValidation } from "../src/utils/formValidation";
import { FormValidator } from "../src/utils/formValidation";

// Import constants
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

// Constants
const VALIDATION_RULES = {
  email: [
    { type: 'required', fieldName: 'Email' },
    { type: 'email' }
  ],
  phone: [
    { type: 'required', fieldName: 'Phone' },
    { type: 'phone' }
  ],
  fullLegalName: [
    { type: 'required', fieldName: 'Full Legal Name' }
  ],
  dob: [
    { type: 'required', fieldName: 'Date of Birth' },
    { type: 'date' }
  ]
};

const INITIAL_FORM_DATA = {
  fullLegalName: '',
  date: null,
  phone: '',
  email: '',
  address: '',
  cityStateZip: '',
  age: '',
  dob: null,
  ssn: '',
  gender: '',
  activeDutyServiceMember: '',
  dodBenefit: '',
  currentEmployer: '',
  spouseName: '',
  spouseAge: '',
  spouseDob: null,
  spouseSsn: '',
  spouseEmployer: '',
  referringProvider: '',
  primaryHealthInsurance: '',
  policy: '',
  group: '',
  knownMedicalConditions: '',
  drugAllergies: '',
  currentMedications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  firstName: '',
  lastName: '',
  dateOfBirth: null
};

// Custom hooks
const useFormState = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    showErrors,
    setShowErrors,
    handleInputChange
  };
};

const useSessionState = () => {
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    const loadSessionId = async () => {
      const sessionId = await PatientSessionService.getCurrentSessionId();
      setCurrentSessionId(sessionId);
    };
    loadSessionId();
  }, []);

  return { currentSessionId, setCurrentSessionId };
};

const useFormRefs = () => {
  const sectionRefs = {
    personalSection: React.useRef(null),
    militarySection: React.useRef(null),
    spouseSection: React.useRef(null),
    healthcareSection: React.useRef(null),
    medicalSection: React.useRef(null),
    emergencySection: React.useRef(null)
  };

  const fieldRefs = {
    // Personal Information fields
    fullLegalName: React.useRef(null),
    date: React.useRef(null),
    phone: React.useRef(null),
    email: React.useRef(null),
    address: React.useRef(null),
    cityStateZip: React.useRef(null),
    age: React.useRef(null),
    dob: React.useRef(null),
    ssn: React.useRef(null),
    gender: React.useRef(null),
    
    // Military Information fields
    activeDutyServiceMember: React.useRef(null),
    dodBenefit: React.useRef(null),
    
    // Employment Information fields
    currentEmployer: React.useRef(null),
    
    // Spouse Information fields
    spouseName: React.useRef(null),
    spouseAge: React.useRef(null),
    spouseDob: React.useRef(null),
    spouseSsn: React.useRef(null),
    spouseEmployer: React.useRef(null),
    
    // Healthcare Information fields
    referringProvider: React.useRef(null),
    primaryHealthInsurance: React.useRef(null),
    policy: React.useRef(null),
    group: React.useRef(null),
    
    // Medical Information fields
    knownMedicalConditions: React.useRef(null),
    drugAllergies: React.useRef(null),
    currentMedications: React.useRef(null),
    
    // Emergency Contact fields
    emergencyContactName: React.useRef(null),
    emergencyContactPhone: React.useRef(null),
    emergencyContactRelationship: React.useRef(null)
  };

  const scrollViewRef = useRef(null);

  return {
    sectionRefs,
    fieldRefs,
    scrollViewRef
  };
};

export default function PatientDemographicSheetScreen() {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const { animatedStyle } = useScreenAnimation();

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Custom hooks
  const formState = useFormState();
  const { currentSessionId, setCurrentSessionId } = useSessionState();
  const { sectionRefs, fieldRefs, scrollViewRef } = useFormRefs();

  // Load saved form data when component mounts
  useEffect(() => {
    loadSavedFormData();
  }, []);

  // Load saved form data from offline storage
  const loadSavedFormData = async () => {
    try {
      const savedData = await OfflineStorageService.getOfflineFormData('patientDemographic');
      if (savedData) {
        formState.setFormData(savedData);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    formState.handleInputChange(field, value);
  };

  const handleDropdownSelect = (field, value) => {
    formState.handleInputChange(field, value);
    setOpenDropdownIndex(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      formState.setShowErrors(true);

      // STEP 1: Validate form data using the validation
      const validation = PatientIntakeValidation.validateForm(formState.formData);

      if (!validation.isValid) {
        // Set all validation errors
        formState.setValidationErrors(validation.errors);
        
        // Show error alert with all validation errors
        const errorMessages = Object.values(validation.errors).join('\n');
        Alert.alert(
          "Validation Errors",
          errorMessages,
          [
            {
              text: "OK",
              onPress: () => {
                // Scroll to the first field with an error
                const firstErrorField = Object.keys(validation.errors)[0];
                const fieldRef = fieldRefs[firstErrorField];
                if (fieldRef && fieldRef.current && scrollViewRef.current) {
                  fieldRef.current.measureLayout(
                    scrollViewRef.current,
                    (x, y) => {
                      scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
                    },
                    () => console.log('Failed to measure layout')
                  );
                } else {
                  // Fallback to section scrolling if field ref is not available
                  const sectionRef = getSectionRef(firstErrorField);
                  if (sectionRef && sectionRef.current && scrollViewRef.current) {
                    sectionRef.current.measureLayout(
                      scrollViewRef.current,
                      (x, y) => {
                        scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
                      },
                      () => console.log('Failed to measure layout')
                    );
                  }
                }
              }
            }
          ]
        );
        setIsSubmitting(false);
        return;
      }

      // STEP 2: Check internet connectivity before submission
      const isOnline = await OfflineStorageService.isOnline();
      if (!isOnline) {
        Alert.alert(
          "No Internet Connection", 
          "Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
        setIsSubmitting(false);
        return;
      }

      // STEP 3: Clear any existing errors since validation passed
      formState.setValidationErrors({});

      // STEP 4: Show success modal after 1 second for better UX
      setTimeout(() => {
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 1000);

      // STEP 5: Submit the patient demographic data asynchronously in the background (only after validation passed)
      FormSubmissionService.submitPatientDemographics(formState.formData).then(result => {
        if (result.success) {
          console.log('Patient Demographics: Success - Both email and database succeeded');
        } else {
          // Check if email was sent despite database failure
          if (result.emailSent) {
            console.log('Patient Demographics: Partial Success - Email sent but database failed');
            console.log('Error details:', result.error);
          } else {
            console.error('Patient Demographics: Complete Failure - Both email and database failed');
            console.error('Error details:', result.error);
          }
        }
      }).catch(error => {
        console.error('Patient Demographics: Unexpected error:', error);
      });

    } catch (error) {
      console.error('Error in patient demographics form validation:', error);
      Alert.alert(
        'Error',
        'An error occurred while validating the form. Please try again.',
        [{ text: 'OK' }]
      );
      setIsSubmitting(false);
    }
  };

  // Helper function to get section ref based on field name
  const getSectionRef = (fieldName) => {
    const sectionMap = {
      // Personal Information fields
      fullLegalName: 'personalSection',
      date: 'personalSection',
      phone: 'personalSection',
      email: 'personalSection',
      address: 'personalSection',
      cityStateZip: 'personalSection',
      age: 'personalSection',
      dob: 'personalSection',
      ssn: 'personalSection',
      gender: 'personalSection',
      
      // Military Information fields
      activeDutyServiceMember: 'militarySection',
      dodBenefit: 'militarySection',
      
      // Spouse Information fields
      spouseName: 'spouseSection',
      spouseAge: 'spouseSection',
      spouseDob: 'spouseSection',
      spouseSsn: 'spouseSection',
      spouseEmployer: 'spouseSection',
      
      // Healthcare Information fields
      referringProvider: 'healthcareSection',
      primaryHealthInsurance: 'healthcareSection',
      policy: 'healthcareSection',
      group: 'healthcareSection',
      
      // Medical Information fields
      knownMedicalConditions: 'medicalSection',
      drugAllergies: 'medicalSection',
      currentMedications: 'medicalSection',
      
      // Emergency Contact fields
      emergencyContactName: 'emergencySection',
      emergencyContactPhone: 'emergencySection',
      emergencyContactRelationship: 'emergencySection'
    };

    return sectionRefs[sectionMap[fieldName]];
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to forms list
    router.push('/new-patients');
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderDropdown = (field, options, placeholder, ref) => {
    const isOpen = openDropdownIndex === field;
    const selectedValue = formState.formData[field];
    const displayText = selectedValue || placeholder;
    
    return (
      <View style={[
        styles.dropdownContainer,
        formState.validationErrors[field] && formState.showErrors && styles.dropdownContainerError
      ]}>
        <TouchableOpacity
          ref={ref}
          style={styles.dropdown}
          onPress={() => setOpenDropdownIndex(isOpen ? null : field)}
        >
          <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
            {displayText}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={formState.validationErrors[field] && formState.showErrors ? '#dc3545' : Colors.primary} 
            style={{ marginLeft: 8 }} 
          />
        </TouchableOpacity>
        
        {isOpen && (
          <ScrollView style={styles.dropdownOptions} nestedScrollEnabled={true}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  index === options.length - 1 && styles.lastDropdownOption
                ]}
                onPress={() => handleDropdownSelect(field, option.value)}
              >
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {formState.validationErrors[field] && formState.showErrors && (
          <Text style={styles.errorText}>{formState.validationErrors[field]}</Text>
        )}
      </View>
    );
  };

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" }
  ];

  const yesNoOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" }
  ];

  return (
    <AppBar>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={scrollViewPadding}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <ExpoImage source={require("../assets/new-patient-hero.jpg")} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>PATIENT{'\n'}DEMOGRAPHIC{'\n'}SHEET</Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <View ref={sectionRefs.personalSection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Legal Name *</Text>
                <TextInput
                  ref={fieldRefs.fullLegalName}
                  style={[
                    styles.textInput,
                    formState.validationErrors.fullLegalName && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.fullLegalName}
                  onChangeText={(value) => handleInputChange('fullLegalName', value)}
                  placeholder="Enter your full legal name"
                  placeholderTextColor="#666666"
                />
                {formState.validationErrors.fullLegalName && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.fullLegalName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date *</Text>
                <ModernDatePicker
                  ref={fieldRefs.date}
                  value={formState.formData.date}
                  onDateChange={(date) => handleInputChange('date', date)}
                  placeholder="Select Date"
                  placeholderTextColor="#666666"
                  textColor="#000000"
                  style={styles.datePickerContainer}
                  error={formState.validationErrors.date && formState.showErrors ? formState.validationErrors.date : null}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone *</Text>
                <TextInput
                  ref={fieldRefs.phone}
                  style={[
                    styles.textInput,
                    formState.validationErrors.phone && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="(123) 456-7890"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                />
                {formState.validationErrors.phone && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  ref={fieldRefs.email}
                  style={[
                    styles.textInput,
                    formState.validationErrors.email && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="email@example.com"
                  placeholderTextColor="#666666"
                  keyboardType="email-address"
                />
                {formState.validationErrors.email && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  ref={fieldRefs.address}
                  style={[
                    styles.textInput,
                    formState.validationErrors.address && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Street Address"
                  placeholderTextColor="#666666"
                />
                {formState.validationErrors.address && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.address}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City, State ZIP *</Text>
                <TextInput
                  ref={fieldRefs.cityStateZip}
                  style={[
                    styles.textInput,
                    formState.validationErrors.cityStateZip && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.cityStateZip}
                  onChangeText={(value) => handleInputChange('cityStateZip', value)}
                  placeholder="City, State ZIP"
                  placeholderTextColor="#666666"
                />
                {formState.validationErrors.cityStateZip && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.cityStateZip}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Age *</Text>
                  <TextInput
                    ref={fieldRefs.age}
                    style={[
                      styles.textInput,
                      formState.validationErrors.age && formState.showErrors && styles.textInputError
                    ]}
                    value={formState.formData.age}
                    onChangeText={(value) => handleInputChange('age', value)}
                    placeholder="Age"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                  {formState.validationErrors.age && formState.showErrors && (
                    <Text style={styles.errorText}>{formState.validationErrors.age}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Date of Birth *</Text>
                  <ModernDatePicker
                    ref={fieldRefs.dob}
                    value={formState.formData.dob}
                    onDateChange={(date) => handleInputChange('dob', date)}
                    placeholder="Select Date of Birth"
                    placeholderTextColor="#666666"
                    textColor="#000000"
                    isDateOfBirth={true}
                    style={styles.datePickerContainer}
                    error={formState.validationErrors.dob && formState.showErrors ? formState.validationErrors.dob : null}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Social Security Number</Text>
                <TextInput
                  ref={fieldRefs.ssn}
                  style={[
                    styles.textInput,
                    formState.validationErrors.ssn && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.ssn}
                  onChangeText={(value) => handleInputChange('ssn', value)}
                  placeholder="XXX-XX-XXXX"
                  placeholderTextColor="#666666"
                />
                {formState.validationErrors.ssn && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.ssn}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender *</Text>
                {renderDropdown('gender', genderOptions, 'Select Gender', fieldRefs.gender)}
              </View>
            </View>

            {/* Military Information Section */}
            <View ref={sectionRefs.militarySection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="shield" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Military Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Active Duty Service Member *</Text>
                {renderDropdown('activeDutyServiceMember', yesNoOptions, 'Select Yes/No', fieldRefs.activeDutyServiceMember)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DOD Benefit</Text>
                <TextInput
                  ref={fieldRefs.dodBenefit}
                  style={styles.textInput}
                  value={formState.formData.dodBenefit}
                  onChangeText={(value) => handleInputChange('dodBenefit', value)}
                  placeholder="DOD Benefit Information"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Employment Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="briefcase" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Employment Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Employer</Text>
                <TextInput
                  ref={fieldRefs.currentEmployer}
                  style={styles.textInput}
                  value={formState.formData.currentEmployer}
                  onChangeText={(value) => handleInputChange('currentEmployer', value)}
                  placeholder="Current Employer"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Spouse Information Section */}
            <View ref={sectionRefs.spouseSection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="heart" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Spouse Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Spouse Name</Text>
                <TextInput
                  ref={fieldRefs.spouseName}
                  style={styles.textInput}
                  value={formState.formData.spouseName}
                  onChangeText={(value) => handleInputChange('spouseName', value)}
                  placeholder="Spouse Full Name"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Spouse Age</Text>
                  <TextInput
                    ref={fieldRefs.spouseAge}
                    style={styles.textInput}
                    value={formState.formData.spouseAge}
                    onChangeText={(value) => handleInputChange('spouseAge', value)}
                    placeholder="Age"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Spouse DOB</Text>
                  <ModernDatePicker
                    ref={fieldRefs.spouseDob}
                    value={formState.formData.spouseDob}
                    onDateChange={(date) => handleInputChange('spouseDob', date)}
                    placeholder="Select Spouse DOB"
                    placeholderTextColor="#666666"
                    textColor="#000000"
                    isDateOfBirth={true}
                    style={styles.datePickerContainer}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Spouse Social Security</Text>
                <TextInput
                  ref={fieldRefs.spouseSsn}
                  style={[
                    styles.textInput,
                    formState.validationErrors.spouseSsn && formState.showErrors && styles.textInputError
                  ]}
                  value={formState.formData.spouseSsn}
                  onChangeText={(value) => handleInputChange('spouseSsn', value)}
                  placeholder="XXX-XX-XXXX"
                  placeholderTextColor="#666666"
                />
                {formState.validationErrors.spouseSsn && formState.showErrors && (
                  <Text style={styles.errorText}>{formState.validationErrors.spouseSsn}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Spouse Employer</Text>
                <TextInput
                  ref={fieldRefs.spouseEmployer}
                  style={styles.textInput}
                  value={formState.formData.spouseEmployer}
                  onChangeText={(value) => handleInputChange('spouseEmployer', value)}
                  placeholder="Spouse Employer"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Healthcare Information Section */}
            <View ref={sectionRefs.healthcareSection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="medical" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Healthcare Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Referring Provider</Text>
                <TextInput
                  ref={fieldRefs.referringProvider}
                  style={styles.textInput}
                  value={formState.formData.referringProvider}
                  onChangeText={(value) => handleInputChange('referringProvider', value)}
                  placeholder="Referring Provider"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Primary Health Insurance</Text>
                <TextInput
                  ref={fieldRefs.primaryHealthInsurance}
                  style={styles.textInput}
                  value={formState.formData.primaryHealthInsurance}
                  onChangeText={(value) => handleInputChange('primaryHealthInsurance', value)}
                  placeholder="Insurance Provider"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Policy</Text>
                  <TextInput
                    ref={fieldRefs.policy}
                    style={styles.textInput}
                    value={formState.formData.policy}
                    onChangeText={(value) => handleInputChange('policy', value)}
                    placeholder="Policy Number"
                    placeholderTextColor="#666666"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Group</Text>
                  <TextInput
                    ref={fieldRefs.group}
                    style={styles.textInput}
                    value={formState.formData.group}
                    onChangeText={(value) => handleInputChange('group', value)}
                    placeholder="Group Number"
                    placeholderTextColor="#666666"
                  />
                </View>
              </View>
            </View>

            {/* Medical Information Section */}
            <View ref={sectionRefs.medicalSection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="fitness" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Medical Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Known Medical Conditions</Text>
                <TextInput
                  ref={fieldRefs.knownMedicalConditions}
                  style={[styles.textInput, styles.textArea]}
                  value={formState.formData.knownMedicalConditions}
                  onChangeText={(value) => handleInputChange('knownMedicalConditions', value)}
                  placeholder="List any known medical conditions"
                  placeholderTextColor="#666666"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Drug Allergies</Text>
                <TextInput
                  ref={fieldRefs.drugAllergies}
                  style={[styles.textInput, styles.textArea]}
                  value={formState.formData.drugAllergies}
                  onChangeText={(value) => handleInputChange('drugAllergies', value)}
                  placeholder="List any drug allergies"
                  placeholderTextColor="#666666"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Medications</Text>
                <TextInput
                  ref={fieldRefs.currentMedications}
                  style={[styles.textInput, styles.textArea]}
                  value={formState.formData.currentMedications}
                  onChangeText={(value) => handleInputChange('currentMedications', value)}
                  placeholder="List current medications with dosages"
                  placeholderTextColor="#666666"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Emergency Contact Section */}
            <View ref={sectionRefs.emergencySection} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="call" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact Name</Text>
                <TextInput
                  ref={fieldRefs.emergencyContactName}
                  style={styles.textInput}
                  value={formState.formData.emergencyContactName}
                  onChangeText={(value) => handleInputChange('emergencyContactName', value)}
                  placeholder="Emergency Contact Name"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact Phone</Text>
                <TextInput
                  ref={fieldRefs.emergencyContactPhone}
                  style={styles.textInput}
                  value={formState.formData.emergencyContactPhone}
                  onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
                  placeholder="(123) 456-7890"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact Relationship</Text>
                <TextInput
                  ref={fieldRefs.emergencyContactRelationship}
                  style={styles.textInput}
                  value={formState.formData.emergencyContactRelationship}
                  onChangeText={(value) => handleInputChange('emergencyContactRelationship', value)}
                  placeholder="Relationship"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Submit Button */}
            <SubmitButton
              onPress={handleSubmit}
              onPressIn={() => setIsSubmitPressed(true)}
              onPressOut={() => setIsSubmitPressed(false)}
              isPressed={isSubmitPressed}
              title="SUBMIT"
              icon="send"
            />
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        <LoadingOverlay
          visible={isSubmitting}
          message="Submitting patient information..."
        />

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          title="Form Submitted!"
          message="Your patient demographic information has been successfully submitted."
          onClose={handleSuccessModalClose}
          buttonText="Continue"
        />
      </SafeAreaView>
    </AppBar>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    height: 220,
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
    alignItems: "center",
    paddingTop: Layout.spacing.xxlarge,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  heroTitle: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.overlayText,
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    marginHorizontal: Layout.spacing.large,
    marginTop: 0,
    marginBottom: Spacing.SECTION_TO_SECTION,
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    padding: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.large,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 12,
  },
  sectionIcon: {
    marginRight: Layout.spacing.large,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Layout.spacing.large,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 0.48,
  },
  label: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    padding: 14,
    fontSize: Fonts.sizes.regular,
    color: '#000000',
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.white,
  },
  dropdownContainerError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  dropdown: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: Fonts.sizes.regular,
    color: '#000000',
    flex: 1,
  },
  placeholderText: {
    color: '#666666',
  },
  dropdownOptions: {
    maxHeight: 150,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: Layout.borderRadius.medium,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastDropdownOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: Fonts.sizes.regular,
    color: '#000000',
  },
  datePickerContainer: {
    // Remove custom styling to use default ModernDatePicker styling
  },
  textInputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: Fonts.sizes.small,
    marginTop: 4,
    marginLeft: 4,
  },
});