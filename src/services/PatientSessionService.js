import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

class PatientSessionService {
  static STORAGE_KEY = 'patient_session_id';

  /**
   * Generate a unique temporary patient ID
   */
  static generateTemporaryId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TMP_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Get or create a patient session
   */
  static async getOrCreateSession() {
    try {
      // Check if we already have a session stored locally
      let sessionId = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (sessionId) {
        // Verify the session exists in the database
        const { data: session, error } = await supabase
          .from('patient_sessions')
          .select('*')
          .eq('temporary_id', sessionId)
          .single();

        if (!error && session) {
          return {
            success: true,
            sessionId: sessionId,
            session: session,
            isExisting: true
          };
        }
      }

      // Create a new session
      const temporaryId = this.generateTemporaryId();
      
      const { data: newSession, error: createError } = await supabase
        .from('patient_sessions')
        .insert([{
          temporary_id: temporaryId,
          is_converted: false
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Store the session ID locally
      await AsyncStorage.setItem(this.STORAGE_KEY, temporaryId);

      return {
        success: true,
        sessionId: temporaryId,
        session: newSession,
        isExisting: false
      };

    } catch (error) {
      console.error('Error managing patient session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert temporary session to named patient
   */
  static async convertSessionToPatient(sessionId, patientData) {
    try {
      // First, create the patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert([{
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          date_of_birth: patientData.dateOfBirth,
          gender: patientData.gender,
          email: patientData.email,
          phone: patientData.phone,
          address: patientData.address,
          city: patientData.city,
          state: patientData.state,
          zip_code: patientData.zipCode,
          emergency_contact_name: patientData.emergencyContactName,
          emergency_contact_phone: patientData.emergencyContactPhone,
          emergency_contact_relationship: patientData.emergencyContactRelationship,
          // Spouse Information
          spouse_name: patientData.spouseName,
          spouse_age: patientData.spouseAge,
          spouse_date_of_birth: patientData.spouseDateOfBirth,
          spouse_ssn: patientData.spouseSsn,
          spouse_employer: patientData.spouseEmployer,
          // Military Information
          active_duty_service_member: patientData.activeDutyServiceMember,
          dod_benefit: patientData.dodBenefit,
          // Employment Information
          current_employer: patientData.currentEmployer,
          // Healthcare Information
          referring_provider: patientData.referringProvider,
          primary_health_insurance: patientData.primaryHealthInsurance,
          policy_number: patientData.policyNumber,
          group_number: patientData.groupNumber,
          // Medical Information
          known_medical_conditions: patientData.knownMedicalConditions,
          drug_allergies: patientData.drugAllergies,
          current_medications: patientData.currentMedications
        }])
        .select()
        .single();

      if (patientError) {
        throw patientError;
      }

      // Update the session to link it to the patient
      const { error: sessionError } = await supabase
        .from('patient_sessions')
        .update({
          patient_id: patient.id,
          is_converted: true
        })
        .eq('temporary_id', sessionId);

      if (sessionError) {
        throw sessionError;
      }

      // Update all form submissions to link to the patient
      const sessionData = await supabase
        .from('patient_sessions')
        .select('id')
        .eq('temporary_id', sessionId)
        .single();

      if (sessionData.data) {
        const sessionUuid = sessionData.data.id;

        // Update all related form tables
        await Promise.all([
          supabase
            .from('bdi_form')
            .update({ patient_id: patient.id })
            .eq('patient_session_id', sessionUuid),

          supabase
            .from('phq9_form')
            .update({ patient_id: patient.id })
            .eq('patient_session_id', sessionUuid),

          supabase
            .from('med_history_form')
            .update({ patient_id: patient.id })
            .eq('patient_session_id', sessionUuid),

          supabase
            .from('pre_cert_med_list_form')
            .update({ patient_id: patient.id })
            .eq('patient_session_id', sessionUuid)
        ]);
      }

      return {
        success: true,
        patient: patient,
        sessionId: sessionId
      };

    } catch (error) {
      console.error('Error converting session to patient:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get session information
   */
  static async getSessionInfo(sessionId) {
    try {
      const { data: session, error } = await supabase
        .from('patient_sessions')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('temporary_id', sessionId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        session: session
      };

    } catch (error) {
      console.error('Error getting session info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clear current session (for testing or reset)
   */
  static async clearSession() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current session ID from storage
   */
  static async getCurrentSessionId() {
    try {
      // Try to get existing session ID from storage
      let sessionId = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!sessionId) {
        // If no session exists, create a new one
        const result = await this.getOrCreateSession();
        if (!result.success) {
          throw new Error('Failed to create new session');
        }
        sessionId = result.sessionId;
      }

      // Verify the session exists in the database
      const { data: session, error } = await supabase
        .from('patient_sessions')
        .select('id')
        .eq('temporary_id', sessionId)
        .single();

      if (error || !session) {
        // If session doesn't exist in database, create a new one
        const result = await this.getOrCreateSession();
        if (!result.success) {
          throw new Error('Failed to create new session');
        }
        sessionId = result.sessionId;
      }

      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      throw new Error('Failed to get session ID');
    }
  }
}

export default PatientSessionService;
