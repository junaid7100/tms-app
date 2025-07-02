import { supabase } from '../lib/supabase';
import PatientSessionService from './PatientSessionService';
import OfflineStorageService from './OfflineStorageService';
import ValidationService from './ValidationService';
import { Alert } from 'react-native';
import { PatientIntakeValidation } from '../utils/formValidation';
import PDFEmailService from './PDFEmailService';

class FormSubmissionService {
  
  /**
   * Get session UUID from temporary ID
   */
  static async getSessionUuid(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // First try to get the session by temporary_id
      const { data: session, error } = await supabase
      .from('patient_sessions')
      .select('id')
      .eq('temporary_id', sessionId)
      .single();

    if (error) {
        console.error('Error getting session UUID:', error);
        throw new Error(`Failed to get session UUID: ${error.message}`);
      }

      if (!session || !session.id) {
        throw new Error('Session not found or invalid');
      }

      return session.id;
    } catch (error) {
      console.error('Error in getSessionUuid:', error);
      throw error;
    }
  }

  /**
   * Calculate BDI severity level based on total score
   */
  static calculateBDISeverity(totalScore) {
    if (totalScore <= 13) return 'Minimal';
    if (totalScore <= 19) return 'Mild';
    if (totalScore <= 28) return 'Moderate';
    if (totalScore <= 63) return 'Severe';
    return 'Extreme';
  }

  /**
   * Calculate PHQ-9 severity level based on total score
   */
  static calculatePHQ9Severity(totalScore) {
    if (totalScore <= 4) return 'Minimal';
    if (totalScore <= 9) return 'Mild';
    if (totalScore <= 14) return 'Moderate';
    if (totalScore <= 19) return 'Moderately Severe';
    return 'Severe';
  }

  /**
   * Send email notification regardless of database success
   */
  static async sendEmailNotification(formType, formData) {
    try {
      console.log(`Sending email notification for ${formType}`);
      const emailResult = await PDFEmailService.generateAndSendPDF(formType, formData);
      
      if (!emailResult.success) {
        console.error(`Failed to send email for ${formType}:`, emailResult.error);
        // Don't throw error - we want to continue with database operations
      } else {
        console.log(`Email sent successfully for ${formType}`);
      }
      
      return emailResult;
    } catch (error) {
      console.error(`Error sending email for ${formType}:`, error);
      // Don't throw error - we want to continue with database operations
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit BDI assessment
   */
  static async submitBDIAssessment(formData) {
    let emailSent = false;
    
    try {
      // Send email notification first
      await this.sendEmailNotification('BDI', formData);
      emailSent = true;

      const tempSessionId = await PatientSessionService.getCurrentSessionId();
      const sessionUUID = await this.getSessionUuid(tempSessionId);

      const bdiData = {
        patient_session_id: sessionUUID,
        total_score: formData.totalScore,
        sadness_response: formData.responses[0]?.toString() || '0',
        pessimism_response: formData.responses[1]?.toString() || '0',
        past_failure_response: formData.responses[2]?.toString() || '0',
        loss_of_pleasure_response: formData.responses[3]?.toString() || '0',
        guilty_feelings_response: formData.responses[4]?.toString() || '0',
        punishment_feelings_response: formData.responses[5]?.toString() || '0',
        self_dislike_response: formData.responses[6]?.toString() || '0',
        self_criticalness_response: formData.responses[7]?.toString() || '0',
        suicidal_thoughts_response: formData.responses[8]?.toString() || '0',
        crying_response: formData.responses[9]?.toString() || '0',
        agitation_response: formData.responses[10]?.toString() || '0',
        loss_of_interest_response: formData.responses[11]?.toString() || '0',
        indecisiveness_response: formData.responses[12]?.toString() || '0',
        worthlessness_response: formData.responses[13]?.toString() || '0',
        loss_of_energy_response: formData.responses[14]?.toString() || '0',
        sleep_changes_response: formData.responses[15]?.toString() || '0',
        irritability_response: formData.responses[16]?.toString() || '0',
        appetite_changes_response: formData.responses[17]?.toString() || '0',
        concentration_difficulty_response: formData.responses[18]?.toString() || '0',
        tiredness_response: formData.responses[19]?.toString() || '0',
        loss_of_interest_sex_response: formData.responses[20]?.toString() || '0',
        assessment_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
          .from('bdi_form')
        .insert([bdiData]);

      if (error) {
        console.error('Error submitting BDI assessment:', error);
        throw error;
      }

      return { success: true, data, emailSent };
    } catch (error) {
      console.error('Error submitting BDI assessment:', error);
      
      // If email wasn't sent yet, try to send it now
      if (!emailSent) {
        await this.sendEmailNotification('BDI', formData);
      }
      
      return { success: false, error: error.message, emailSent };
    }
  }

  /**
   * Submit PHQ-9 screening
   */
  static async submitPHQ9Screening(formData) {
    let emailSent = false;
    
    try {
      // Send email notification first
      await this.sendEmailNotification('PHQ-9', formData);
      emailSent = true;

      const tempSessionId = await PatientSessionService.getCurrentSessionId();
      const sessionUUID = await this.getSessionUuid(tempSessionId);

      const phq9Data = {
        patient_session_id: sessionUUID,
        total_score: formData.totalScore,
        interest_pleasure_response: formData.responses[0]?.toString() || '0',
        feeling_down_response: formData.responses[1]?.toString() || '0',
        sleep_problems_response: formData.responses[2]?.toString() || '0',
        tired_energy_response: formData.responses[3]?.toString() || '0',
        appetite_problems_response: formData.responses[4]?.toString() || '0',
        self_worth_response: formData.responses[5]?.toString() || '0',
        concentration_problems_response: formData.responses[6]?.toString() || '0',
        movement_problems_response: formData.responses[7]?.toString() || '0',
        suicidal_thoughts_response: formData.responses[8]?.toString() || '0',
        assessment_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
          .from('phq9_form')
        .insert([phq9Data]);

      if (error) {
        console.error('Error submitting PHQ-9 screening:', error);
        throw error;
      }

      return { success: true, data, emailSent };
    } catch (error) {
      console.error('Error submitting PHQ-9 screening:', error);
      
      // If email wasn't sent yet, try to send it now
      if (!emailSent) {
        await this.sendEmailNotification('PHQ-9', formData);
      }
      
      return { success: false, error: error.message, emailSent };
    }
  }

  /**
   * Submit medical history
   */
  static async submitMedicalHistory(formData) {
    let emailSent = false;
    
    try {
      // Send email notification first
      await this.sendEmailNotification('Medical History', formData);
      emailSent = true;

      const tempSessionId = await PatientSessionService.getCurrentSessionId();
      const sessionUUID = await this.getSessionUuid(tempSessionId);

      // Validate session UUID
      if (!sessionUUID) {
        throw new Error('Failed to get valid session UUID');
      }

      // Map medical conditions from form data to database columns
      const medicalHistoryData = {
        patient_session_id: sessionUUID,
        // Map each condition from the form's medicalConditions object to its corresponding database column
        asthma: formData.medicalConditions?.ASTHMA === true,
        headache: formData.medicalConditions?.HEADACHE === true,
        heart_disease: formData.medicalConditions?.['HEART DISEASE'] === true,
        appetite_problems: formData.medicalConditions?.['APPETITE PROBLEMS'] === true,
        weight_loss_gain: formData.medicalConditions?.['WEIGHT LOSS/GAIN'] === true,
        sleep_difficulty: formData.medicalConditions?.['SLEEP DIFFICULTY'] === true,
        anxiety: formData.medicalConditions?.ANXIETY === true,
        stomach_trouble: formData.medicalConditions?.['STOMACH TROUBLE'] === true,
        constipation: formData.medicalConditions?.CONSTIPATION === true,
        glaucoma: formData.medicalConditions?.GLAUCOMA === true,
        aids_hiv: formData.medicalConditions?.['AIDS/HIV'] === true,
        hepatitis: formData.medicalConditions?.HEPATITIS === true,
        thyroid_disease: formData.medicalConditions?.['THYROID DISEASE'] === true,
        syphilis: formData.medicalConditions?.SYPHILIS === true,
        seizures: formData.medicalConditions?.SEIZURES === true,
        gonorrhea: formData.medicalConditions?.GONORRHEA === true,
        tb: formData.medicalConditions?.TB === true,
        high_blood_pressure: formData.medicalConditions?.['HIGH BLOOD PRESSURE'] === true,
        diabetes: formData.medicalConditions?.DIABETES === true,
        drinking_problems: formData.medicalConditions?.['DRINKING PROBLEMS'] === true,
        substance_abuse: formData.medicalConditions?.['SUBSTANCE ABUSE'] === true,
        fatigue: formData.medicalConditions?.FATIGUE === true,
        loss_of_concentration: formData.medicalConditions?.['LOSS OF CONCENTRATION'] === true,
        recurrent_thoughts: formData.medicalConditions?.['RECURRENT THOUGHTS'] === true,
        sexual_problems: formData.medicalConditions?.['SEXUAL PROBLEMS'] === true,
        
        // Map other fields
        suicidal_thoughts: formData.suicidalThoughts,
        attempts: formData.attempts,
        suicidal_explanation: formData.suicidalExplanation,
        previous_psychiatrist: formData.previousPsychiatrist,
        psychiatric_hospitalizations: formData.psychiatricHospitalizations,
        legal_charges: formData.legalCharges,
        legal_explanation: formData.legalExplanation,
        allergies: formData.allergies,
        family_history: formData.familyHistory,
        signature: formData.signature,
        assessment_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
          .from('med_history_form')
        .insert([medicalHistoryData]);

      if (error) {
        console.error('Error submitting medical history:', error);
        throw error;
      }

      return { success: true, data, emailSent };
    } catch (error) {
      console.error('Error submitting medical history:', error);
      
      // If email wasn't sent yet, try to send it now
      if (!emailSent) {
        try {
          await this.sendEmailNotification('Medical History', formData);
          emailSent = true;
        } catch (emailError) {
          console.error('Failed to send fallback email:', emailError);
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Unknown database error', 
        emailSent 
      };
    }
  }

  /**
   * Submit pre-certification medication list
   */
  static async submitPreCertMedList(formData) {
    let emailSent = false;
    
    try {
      // Send email notification first
      await this.sendEmailNotification('Pre-Certification Medication List', formData);
      emailSent = true;

      const tempSessionId = await PatientSessionService.getCurrentSessionId();
      const sessionUUID = await this.getSessionUuid(tempSessionId);

      // Prepare the medication data for database insertion
      const medicationData = {
        patient_session_id: sessionUUID,
        name: formData.name,
        date_of_birth: formData.dateOfBirth,
        assessment_date: new Date().toISOString().split('T')[0]
      };

      // Add medication details to the data object
      Object.entries(formData.medications).forEach(([category, medications]) => {
        Object.entries(medications).forEach(([medName, details]) => {
          if (details.selected) {
            // Clean up medication name to match database column names
            const cleanMedName = medName
              .replace(/\([^)]*\)/g, '')  // Remove everything in parentheses
              .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
              .trim();               // Remove leading/trailing spaces

            // Convert to lowercase and replace spaces with underscores for database column
            const columnName = cleanMedName.toLowerCase().replace(/\s+/g, '_');
            
            medicationData[columnName] = {
              dosage: details.dosage,
              start_date: details.startDate,
              end_date: details.endDate,
              reason_for_discontinuing: details.reasonForDiscontinuing
            };
          }
        });
      });

      const { data, error } = await supabase
          .from('pre_cert_med_list_form')
        .insert([medicationData]);

      if (error) {
        console.error('Error submitting pre-cert medication list:', error);
        throw error;
      }

      return { success: true, data, emailSent };
    } catch (error) {
      console.error('Error in submitPreCertMedList:', error);
      
      // If email wasn't sent yet, try to send it now
      if (!emailSent) {
        await this.sendEmailNotification('Pre-Certification Medication List', formData);
      }
      
      return { success: false, error: error.message, emailSent };
    }
  }

  /**
   * Submit patient demographic data
   */
  static async submitPatientDemographics(formData) {
    let emailSent = false;
    
    try {
      // Send email notification first
      await this.sendEmailNotification('Patient Demographics', formData);
      emailSent = true;

      const tempSessionId = await PatientSessionService.getCurrentSessionId();
      const sessionUUID = await this.getSessionUuid(tempSessionId);

      // Validate form data using PatientIntakeValidation
      const validation = PatientIntakeValidation.validateForm(formData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join('\n'));
      }

      const patientData = {
        full_legal_name: formData.fullLegalName,
        date: formData.date,
        date_of_birth: formData.dob,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city_state_zip: formData.cityStateZip,
        age: parseInt(formData.age),
        ssn: formData.ssn,
        gender: formData.gender,
        active_duty_service_member: formData.activeDutyServiceMember,
        dod_benefit: formData.dodBenefit,
        current_employer: formData.currentEmployer,
        spouse_name: formData.spouseName,
        spouse_age: formData.spouseAge ? parseInt(formData.spouseAge) : null,
        spouse_date_of_birth: formData.spouseDob,
        spouse_ssn: formData.spouseSsn,
        spouse_employer: formData.spouseEmployer,
        referring_provider: formData.referringProvider,
        primary_health_insurance: formData.primaryHealthInsurance,
        policy: formData.policy,
        group_number: formData.group,
        known_medical_conditions: formData.knownMedicalConditions,
        drug_allergies: formData.drugAllergies,
        current_medications: formData.currentMedications,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relationship: formData.emergencyContactRelationship
      };

      // First insert the patient data
      const { data: patientResult, error: patientError } = await supabase
        .from('patient_intake_form')
        .insert([patientData])
        .select();

      if (patientError) {
        console.error('Error submitting patient demographics:', patientError);
        throw patientError;
      }

      // Then update the patient_sessions table with the patient_id
      if (patientResult && patientResult[0]) {
        const { error: sessionError } = await supabase
          .from('patient_sessions')
          .update({ patient_id: patientResult[0].id })
          .eq('id', sessionUUID);

        if (sessionError) {
          console.error('Error updating patient session:', sessionError);
          throw sessionError;
        }
      }

      return { success: true, data: patientResult, emailSent };
    } catch (error) {
      console.error('Error submitting patient demographics:', error);
      
      // If email wasn't sent yet, try to send it now
      if (!emailSent) {
        await this.sendEmailNotification('Patient Demographics', formData);
      }
      
      return { success: false, error: error.message, emailSent };
    }
  }

  // Submit form with validation and offline support
  static async submitForm(formType, formData, validationRules, submitFunction) {
    try {
      // Validate form data
      const validationResult = ValidationService.validateFormData(formData, validationRules);
      if (!validationResult.isValid) {
        // Show validation errors in a user-friendly way
        const errorMessages = Object.values(validationResult.errors).join('\n');
        Alert.alert(
          'Validation Error',
          errorMessages,
          [{ text: 'OK' }]
        );
        return { success: false, errors: validationResult.errors };
      }

      // Check if online
      const isOnline = await OfflineStorageService.isOnline();
      
      if (!isOnline) {
        // Save form data offline and add to pending submissions
        await OfflineStorageService.saveOfflineFormData(formType, formData);
        await OfflineStorageService.addPendingSubmission(formType, formData);
        
        Alert.alert(
          'Offline Mode',
          'You are currently offline. Your form has been saved and will be submitted when you are back online.',
          [{ text: 'OK' }]
        );
        
        return { success: true, offline: true };
      }

      // Online submission
      try {
        const result = await submitFunction(formData);
        return { success: true, data: result };
      } catch (error) {
        // Handle submission error
        // Save failed submission for retry
        await OfflineStorageService.addPendingSubmission(formType, formData);
        
        Alert.alert(
          'Submission Error',
          'There was an error submitting your form. It has been saved and will be retried automatically.',
          [{ text: 'OK' }]
        );
        
        return { success: false, error: error.message };
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }

  // Retry pending submissions
  static async retryPendingSubmissions(submitFunction) {
    try {
      const pendingSubmissions = await OfflineStorageService.getPendingSubmissions();
      const isOnline = await OfflineStorageService.isOnline();

      if (!isOnline || pendingSubmissions.length === 0) {
        return;
      }

      for (const submission of pendingSubmissions) {
        try {
          const result = await submitFunction(submission.formData);
          
          // Remove successful submission from pending queue
          await OfflineStorageService.removePendingSubmission(submission.id);
          
          console.log(`Successfully submitted pending form: ${submission.id}`);
        } catch (error) {
          console.error(`Error retrying submission ${submission.id}:`, error);
          
          // Update retry count
          await OfflineStorageService.updateSubmissionRetryCount(submission.id);
          
          // If too many retries, show error to user
          if (submission.retryCount >= 3) {
            Alert.alert(
              'Submission Failed',
              'A form submission has failed multiple times. Please check your connection and try submitting again.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error retrying pending submissions:', error);
    }
  }

  // Clear form data
  static async clearFormData(formType) {
    try {
      await OfflineStorageService.clearOfflineData();
      return { success: true };
    } catch (error) {
      console.error('Error clearing form data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FormSubmissionService;
