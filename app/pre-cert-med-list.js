import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import FormSubmissionService from "../src/services/FormSubmissionService";
import OfflineStorageService from "../src/services/OfflineStorageService";

// Import validation
import { FormValidator } from "../src/utils/formValidation";

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

// Import constants
import Colors from "../src/constants/Colors";
import Fonts from "../src/constants/Fonts";
import Layout from "../src/constants/Layout";
import Spacing from "../src/constants/Spacing";

const medicationCategories = {
  SSRI: [
    "Sertraline (Zoloft)",
    "Fluoxetine (Prozac)",
    "Citalopram (Celexa)",
    "Fluvoxamine (Luvox)",
    "Paroxetine (Paxil)",
    "Paroxetine CR (Paxil CR)",
    "Escitalopram (Lexapro)",
    "Vilazodone (Viibryd)",
    "Vortioxetine (Brintellix/Trintellix)"
  ],
  SNRI: [
    "Venlafaxine (Effexor) IR/XR",
    "Duloxetine (Cymbalta)",
    "Desvenlafaxine (Pristiq)",
    "Levomilnacipran (Fetzima)",
    "Milnacipran (Savella)"
  ],
  TRICYCLIC: [
    "Amitriptyline (Elavil)",
    "Imipramine (Tofranil)",
    "Desipramine (Norpramin/Pertofrane)",
    "Trimipramine (Surmontil)",
    "Clomipramine (Anafranil)",
    "Maprotiline (Ludiomil)",
    "Doxepin (Sinequan)",
    "Nomifensine (Merital)",
    "Nortriptyline (Pamelor/Aventyl)",
    "Protriptyline (Vivactil)",
    "Amoxapine (Asendin)"
  ],
  MAOI: [
    "Phenelzine (Nardil)",
    "Selegiline (Emsam/Eldepryl)",
    "Selegiline patch (Emsam)",
    "Isocarboxazid (Marplan)",
    "Tranylcypromine (Parnate)"
  ],
  ATYPICAL: [
    "Bupropion (Wellbutrin) SR XL",
    "Nefazodone (Serzone/Serzone)",
    "Trazodone (Desyrel)",
    "Mirtazapine (Remeron)"
  ],
  "AUGMENTING AGENT": [
    "Aripiprazole (Abilify)",
    "Ziprasidone (Geodon)",
    "Risperidone (Risperdal)",
    "Quetiapine (Seroquel)",
    "Olanzapine (Zyprexa)",
    "Asenapine (Saphris)",
    "Cariprazine (Vraylar)",
    "Lurasidone (Latuda)",
    "Clozapine (Clozaril)",
    "Paliperidone (Invega)",
    "Brexpiprazole (Rexulti)",
    "Lithium (Eskalith/Lithobid/Lithonate)",
    "Gabapentin (Neurontin)",
    "Lamotrigine (Lamictal)",
    "Topiramate (Topamax)"
  ]
};

const PreCertMedListScreen = () => {
  const router = useRouter();
  const scrollViewPadding = useScrollViewPadding();
  const { animatedStyle } = useScreenAnimation();
  
  // Add refs for scrolling
  const scrollViewRef = useRef(null);
  const nameRef = useRef(null);
  const dateOfBirthRef = useRef(null);
  const medicationsRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: null,
    selectedMedications: {},
    medicationDetails: {}
  });
  
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleMedicationToggle = (category, medication) => {
    const isCurrentlySelected = formData.selectedMedications[category]?.[medication];
    
    setFormData(prev => {
      const newSelectedMedications = {
        ...prev.selectedMedications,
        [category]: {
          ...prev.selectedMedications[category],
          [medication]: !isCurrentlySelected
        }
      };
      
      const newMedicationDetails = { ...prev.medicationDetails };
      const medicationKey = `${category}_${medication}`;
      
      if (!isCurrentlySelected) {
        // Adding medication - initialize empty details
        newMedicationDetails[medicationKey] = {
          dose: "",
          startDate: null,
          endDate: null,
          reasonForDiscontinuing: ""
        };
      } else {
        // Removing medication - delete details
        delete newMedicationDetails[medicationKey];
      }
      
      return {
        ...prev,
        selectedMedications: newSelectedMedications,
        medicationDetails: newMedicationDetails
      };
    });
  };

  const handleMedicationDetailChange = (category, medication, field, value) => {
    const medicationKey = `${category}_${medication}`;
    setFormData(prev => ({
      ...prev,
      medicationDetails: {
        ...prev.medicationDetails,
        [medicationKey]: {
          ...prev.medicationDetails[medicationKey],
          [field]: value
        }
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setShowErrors(true);

      // STEP 1: Validate required fields
      const errors = {};
      
      if (!formData.name?.trim()) {
        errors.name = "Please enter your name.";
      }

      if (!formData.dateOfBirth) {
        errors.dateOfBirth = "Please select your date of birth.";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const firstError = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstError];
        
        Alert.alert(
          "Validation Error",
          firstErrorMessage,
          [{ 
            text: "OK",
            onPress: () => {
              if (firstError === 'name' && nameRef.current && scrollViewRef.current) {
                nameRef.current.measureLayout(
                  scrollViewRef.current,
                  (x, y) => {
                    scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
                  },
                  () => console.log('Failed to measure layout')
                );
              } else if (firstError === 'dateOfBirth' && dateOfBirthRef.current && scrollViewRef.current) {
                dateOfBirthRef.current.measureLayout(
                  scrollViewRef.current,
                  (x, y) => {
                    scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
                  },
                  () => console.log('Failed to measure layout')
                );
              }
            }
          }]
        );
        setIsSubmitting(false);
        return;
      }

      // Clear validation errors since validation passed
      setValidationErrors({});

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

      // STEP 3: Validate that at least one medication is selected
      const hasSelectedMedications = Object.values(formData.selectedMedications).some(
        category => Object.values(category).some(med => med)
      );

      if (!hasSelectedMedications) {
        const medicationError = { medications: "Please select at least one medication." };
        setValidationErrors(medicationError);
        
        Alert.alert(
          "Validation Error",
          "Please select at least one medication.",
          [{ 
            text: "OK",
            onPress: () => {
              if (medicationsRef.current && scrollViewRef.current) {
                medicationsRef.current.measureLayout(
                  scrollViewRef.current,
                  (x, y) => {
                    scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
                  },
                  () => console.log('Failed to measure layout')
                );
              }
            }
          }]
        );
        setIsSubmitting(false);
        return;
      }

      // STEP 4: Validate medication details
      let hasValidationError = false;
      Object.entries(formData.selectedMedications).forEach(([category, medications]) => {
        Object.entries(medications).forEach(([medName, isSelected]) => {
          if (isSelected) {
            const medicationKey = `${category}_${medName}`;
            const details = formData.medicationDetails[medicationKey] || {};

            // Validate dose format
            if (details.dose) {
              const doseRegex = /^\d+(\.\d+)?\s*(mg|g|ml|mcg|IU|units?)?$/i;
              if (!doseRegex.test(details.dose.trim())) {
                Alert.alert(
                  "Validation Error",
                  `Please enter a valid dose for ${medName} (e.g., "50 mg", "100mg", "0.5 g")`,
                  [{ text: "OK" }]
                );
                hasValidationError = true;
                return;
              }
            }

            // Validate dates
            if (details.startDate && details.endDate) {
              const startDate = new Date(details.startDate);
              const endDate = new Date(details.endDate);
              
              if (endDate < startDate) {
                Alert.alert(
                  "Validation Error",
                  `End date cannot be before start date for ${medName}`,
                  [{ text: "OK" }]
                );
                hasValidationError = true;
                return;
              }

              if (startDate > new Date()) {
                Alert.alert(
                  "Validation Error",
                  `Start date cannot be in the future for ${medName}`,
                  [{ text: "OK" }]
                );
                hasValidationError = true;
                return;
              }
            }
          }
        });
      });

      if (hasValidationError) {
        setIsSubmitting(false);
        return;
      }

      // STEP 5: Format the data for submission
      const submissionData = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        medications: {}
      };

      // Process each medication category
      Object.entries(formData.selectedMedications).forEach(([category, medications]) => {
        submissionData.medications[category] = {};
        Object.entries(medications).forEach(([medName, isSelected]) => {
          if (isSelected) {
            const medicationKey = `${category}_${medName}`;
            const details = formData.medicationDetails[medicationKey] || {};
            
            // Clean up medication name to match database column names
            const cleanMedName = medName
              .replace(/\([^)]*\)/g, '')  // Remove everything in parentheses
              .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
              .trim();               // Remove leading/trailing spaces

            submissionData.medications[category][cleanMedName] = {
              selected: true,
              dosage: details.dose?.trim() || null,
              startDate: details.startDate || null,
              endDate: details.endDate || null,
              reasonForDiscontinuing: details.reasonForDiscontinuing?.trim() || null
            };
          }
        });
      });

      // STEP 6: Show success modal after 1 second for better UX
      setTimeout(() => {
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 1000);

      // STEP 7: Submit the form asynchronously in the background (only after validation passed)
      FormSubmissionService.submitPreCertMedList(submissionData).then(result => {
        if (result.success) {
          console.log('Pre-Cert Medication List: Success - Both email and database succeeded');
        } else {
          // Check if email was sent despite database failure
          if (result.emailSent) {
            console.log('Pre-Cert Medication List: Partial Success - Email sent but database failed');
            console.log('Error details:', result.error);
          } else {
            console.error('Pre-Cert Medication List: Complete Failure - Both email and database failed');
            console.error('Error details:', result.error);
          }
        }
      }).catch(error => {
        console.error('Pre-Cert Medication List: Unexpected error:', error);
      });
    } catch (error) {
      console.error('Error in pre-cert medication list validation:', error);
      Alert.alert(
        "Error",
        "An error occurred during validation. Please try again.",
        [{ text: "OK" }]
      );
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleGoBack = () => {
    router.back();
  };

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
              <Text style={styles.heroTitle}>PRE-CERTIFICATION{'\n'}MEDICATION{'\n'}LIST</Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person" size={20} color={Colors.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  ref={nameRef}
                  style={[
                    styles.textInput,
                    validationErrors.name && showErrors && styles.textInputError
                  ]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your name"
                  placeholderTextColor="#666666"
                />
                {validationErrors.name && showErrors && (
                  <Text style={styles.errorText}>{validationErrors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth *</Text>
                <ModernDatePicker
                  ref={dateOfBirthRef}
                  value={formData.dateOfBirth}
                  onDateChange={(date) => handleInputChange('dateOfBirth', date)}
                  placeholder="Select Date of Birth"
                  placeholderTextColor="#666666"
                  textColor="#000000"
                  isDateOfBirth={true}
                  style={styles.datePickerContainer}
                  error={validationErrors.dateOfBirth && showErrors ? validationErrors.dateOfBirth : null}
                />
              </View>
            </View>

            {/* Medication Categories */}
            <View ref={medicationsRef}>
            {Object.entries(medicationCategories).map(([category, medications]) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryTitleContainer}>
                  <Ionicons name="medical" size={18} color={Colors.primary} style={styles.categoryIcon} />
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                
                {medications.map((medication) => {
                  const isSelected = formData.selectedMedications[category]?.[medication];
                  const medicationKey = `${category}_${medication}`;
                  const details = formData.medicationDetails[medicationKey];
                  
                  return (
                    <View key={medication}>
                      <TouchableOpacity
                        style={styles.medicationItem}
                        onPress={() => handleMedicationToggle(category, medication)}
                      >
                        <View style={styles.checkboxContainer}>
                          <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected
                          ]}>
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color={Colors.white} />
                            )}
                          </View>
                          <Text style={styles.medicationText}>{medication}</Text>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Medication Details Fields */}
                      {isSelected && details && (
                        <View style={styles.medicationDetailsContainer}>
                          <View style={styles.detailInputGroup}>
                            <Text style={styles.detailLabel}>Dose (mg)</Text>
                            <TextInput
                              style={styles.detailInput}
                              value={details.dose}
                              onChangeText={(value) => handleMedicationDetailChange(category, medication, 'dose', value)}
                              placeholder="Enter dose"
                              placeholderTextColor="#666666"
                            />
                          </View>
                          
                          <View style={styles.detailInputGroup}>
                            <Text style={styles.detailLabel}>Start Date</Text>
                            <ModernDatePicker
                              value={details.startDate}
                              onDateChange={(date) => handleMedicationDetailChange(category, medication, 'startDate', date)}
                              placeholder="Select Start Date"
                              placeholderTextColor="#666666"
                              textColor="#000000"
                              style={styles.detailDatePickerContainer}
                            />
                          </View>
                          
                          <View style={styles.detailInputGroup}>
                            <Text style={styles.detailLabel}>End Date</Text>
                            <ModernDatePicker
                              value={details.endDate}
                              onDateChange={(date) => handleMedicationDetailChange(category, medication, 'endDate', date)}
                              placeholder="Select End Date"
                              placeholderTextColor="#666666"
                              textColor="#000000"
                              style={styles.detailDatePickerContainer}
                            />
                          </View>
                          
                          <View style={styles.detailInputGroup}>
                            <Text style={styles.detailLabel}>Reason For Discontinuing</Text>
                            <TextInput
                              style={styles.detailInput}
                              value={details.reasonForDiscontinuing}
                              onChangeText={(value) => handleMedicationDetailChange(category, medication, 'reasonForDiscontinuing', value)}
                              placeholder="Enter reason"
                              placeholderTextColor="#666666"
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
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
          message="Submitting medication list..."
        />

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          title="Medication List Submitted!"
          message="Your pre-certification medication list has been successfully submitted."
          onClose={handleSuccessModalClose}
          buttonText="Continue"
        />
      </SafeAreaView>
    </AppBar>
  );
};

export default PreCertMedListScreen;

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
    alignItems: "flex-start",
    paddingLeft: Layout.spacing.xlarge,
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
    alignSelf: "center",
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
    marginBottom: Layout.spacing.medium,
  },
  sectionIcon: {
    marginRight: Layout.spacing.small,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Layout.spacing.medium,
  },
  label: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
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
  textInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    marginTop: 8,
  },
  categorySection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 0,
    padding: Layout.spacing.large,
    marginBottom: Spacing.SECTION_TO_SECTION,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.medium,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  categoryIcon: {
    marginRight: Layout.spacing.small,
  },
  categoryTitle: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  medicationItem: {
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
  },
  medicationText: {
    fontSize: Fonts.sizes.regular,
    color: Colors.text,
    flex: 1,
  },
  medicationDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    marginTop: Layout.spacing.small,
    marginLeft: 32,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  detailInputGroup: {
    marginBottom: Layout.spacing.medium,
  },
  detailLabel: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    padding: 12,
    fontSize: Fonts.sizes.regular,
    color: '#000000',
    backgroundColor: Colors.white,
    fontWeight: Fonts.weights.medium,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.white,
  },
  datePickerContainer: {
    // Remove custom styling to use default ModernDatePicker styling
  },
  detailDatePickerContainer: {
    // Remove custom styling to use default ModernDatePicker styling
  },
}); 