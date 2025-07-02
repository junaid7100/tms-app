// Form Validation Utilities for TMS Application

export class FormValidator {
  
  // Email validation
  static validateEmail(email) {
    if (!email) return { isValid: false, error: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: '' };
  }

  // Phone validation
  static validatePhone(phone) {
    if (!phone) return { isValid: false, error: 'Phone number is required' };
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhone.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true, error: '' };
  }

  // Name validation
  static validateName(name, fieldName = 'Name') {
    if (!name || name.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: `${fieldName} must be less than 50 characters` };
    }
    const nameRegex = /^[a-zA-Z\s\-\'\.]+$/;
    if (!nameRegex.test(name.trim())) {
      return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    }
    return { isValid: true, error: '' };
  }

  // Age validation
  static validateAge(age) {
    if (!age) return { isValid: false, error: 'Age is required' };
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      return { isValid: false, error: 'Age must be a number' };
    }
    if (ageNum < 1 || ageNum > 120) {
      return { isValid: false, error: 'Age must be between 1 and 120' };
    }
    return { isValid: true, error: '' };
  }

  // Date validation
  static validateDate(date, fieldName = 'Date') {
    if (!date) return { isValid: false, error: `${fieldName} is required` };
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
    }
    return { isValid: true, error: '' };
  }

  // Date of birth validation
  static validateDateOfBirth(dob) {
    if (!dob) return { isValid: false, error: 'Date of birth is required' };
    const dobDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(dobDate.getTime())) {
      return { isValid: false, error: 'Please enter a valid date of birth' };
    }
    
    if (dobDate > today) {
      return { isValid: false, error: 'Date of birth cannot be in the future' };
    }
    
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age > 120) {
      return { isValid: false, error: 'Please enter a valid date of birth' };
    }
    
    return { isValid: true, error: '' };
  }

  // Address validation
  static validateAddress(address) {
    if (!address || address.trim() === '') {
      return { isValid: false, error: 'Address is required' };
    }
    if (address.trim().length < 5) {
      return { isValid: false, error: 'Address must be at least 5 characters' };
    }
    if (address.trim().length > 200) {
      return { isValid: false, error: 'Address must be less than 200 characters' };
    }
    return { isValid: true, error: '' };
  }

  // City, State, Zip validation
  static validateCityStateZip(cityStateZip) {
    if (!cityStateZip || cityStateZip.trim() === '') {
      return { isValid: false, error: 'City, State, Zip is required' };
    }
    
    // Expected format: "City, State, Zip" or "City, State Zip"
    const parts = cityStateZip.split(',');
    if (parts.length < 2) {
      return { isValid: false, error: 'Please use format: City, State, Zip' };
    }
    
    const city = parts[0].trim();
    const stateZip = parts[1].trim();
    
    if (city.length < 2) {
      return { isValid: false, error: 'City name must be at least 2 characters' };
    }
    
    if (stateZip.length < 4) {
      return { isValid: false, error: 'State and Zip must be provided' };
    }
    
    return { isValid: true, error: '' };
  }

  // Gender validation
  static validateGender(gender) {
    if (!gender || gender.trim() === '') {
      return { isValid: false, error: 'Gender is required' };
    }
    const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    if (!validGenders.includes(gender)) {
      return { isValid: false, error: 'Please select a valid gender option' };
    }
    return { isValid: true, error: '' };
  }

  // Required field validation
  static validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true, error: '' };
  }

  // Dropdown selection validation
  static validateDropdownSelection(value, fieldName, validOptions = []) {
    if (!value || value === 'Select' || value.trim() === '') {
      return { isValid: false, error: `Please select ${fieldName}` };
    }
    if (validOptions.length > 0 && !validOptions.includes(value)) {
      return { isValid: false, error: `Please select a valid ${fieldName}` };
    }
    return { isValid: true, error: '' };
  }

  // Text area validation
  static validateTextArea(value, fieldName, minLength = 0, maxLength = 1000) {
    if (minLength > 0 && (!value || value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    if (value && value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
    }
    if (value && value.trim().length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    return { isValid: true, error: '' };
  }

  // Checkbox group validation (at least one selected)
  static validateCheckboxGroup(selections, fieldName) {
    if (!selections || typeof selections !== 'object') {
      return { isValid: false, error: `Please select at least one ${fieldName}` };
    }
    
    const hasSelection = Object.values(selections).some(value => value === true);
    if (!hasSelection) {
      return { isValid: false, error: `Please select at least one ${fieldName}` };
    }
    
    return { isValid: true, error: '' };
  }

  // Score validation for assessments
  static validateScore(score, minScore = 0, maxScore = 100) {
    if (score === null || score === undefined || score === '') {
      return { isValid: false, error: 'Score is required' };
    }
    
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum)) {
      return { isValid: false, error: 'Score must be a number' };
    }
    
    if (scoreNum < minScore || scoreNum > maxScore) {
      return { isValid: false, error: `Score must be between ${minScore} and ${maxScore}` };
    }
    
    return { isValid: true, error: '' };
  }

  // Assessment responses validation
  static validateAssessmentResponses(responses, totalQuestions) {
    if (!responses || Object.keys(responses).length === 0) {
      return {
        isValid: false,
        error: 'Please answer all questions before submitting.',
        unansweredQuestions: Array.from({ length: totalQuestions }, (_, i) => i + 1)
      };
    }

    const unansweredQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      if (!responses[i]) {
        unansweredQuestions.push(i + 1);
      }
    }

    if (unansweredQuestions.length > 0) {
      return {
        isValid: false,
        error: `Please answer all questions. Questions ${unansweredQuestions.join(', ')} are unanswered.`,
        unansweredQuestions
      };
    }

    return { isValid: true, error: '', unansweredQuestions: [] };
  }

  // Medication selection validation
  static validateMedicationSelection(medications) {
    if (!medications || typeof medications !== 'object') {
      return { isValid: false, error: 'Please select at least one medication' };
    }
    
    const hasSelection = Object.values(medications).some(category => 
      Object.values(category).some(med => med === true)
    );
    
    if (!hasSelection) {
      return { isValid: false, error: 'Please select at least one medication' };
    }
    
    return { isValid: true, error: '' };
  }

  validateBDIResponses(responses) {
    const errors = {};
    let totalScore = 0;

    // Validate each response
    for (let i = 0; i < 21; i++) {
      const response = responses[i];
      if (!response) {
        errors[`question_${i + 1}`] = `Question ${i + 1} is required`;
        continue;
      }

      // Special handling for sleep and appetite questions
      if (i === 15 || i === 17) { // Sleep and Appetite questions
        const validValues = ['0', '1a', '1b', '2a', '2b', '3a', '3b'];
        if (!validValues.includes(response)) {
          errors[`question_${i + 1}`] = `Invalid response for question ${i + 1}`;
        }
        // Add numeric value to total score
        totalScore += parseInt(response.replace(/[a-z]/g, ''));
      } else {
        // Regular questions
        const value = parseInt(response);
        if (isNaN(value) || value < 0 || value > 3) {
          errors[`question_${i + 1}`] = `Invalid response for question ${i + 1}`;
        }
        totalScore += value;
      }
    }

    // Validate total score
    if (totalScore > 63) {
      errors.totalScore = 'Total score cannot exceed 63';
    }

    // Validate suicidal thoughts severity
    const suicidalResponse = parseInt(responses[8] || '0');
    if (suicidalResponse >= 2) {
      errors.suicidalThoughts = 'Please contact your healthcare provider immediately if you are having thoughts of self-harm';
    }

    // Validate response patterns
    const allSameResponse = Object.values(responses).every((val, _, arr) => val === arr[0]);
    if (allSameResponse) {
      errors.responsePattern = 'Please ensure you are answering each question thoughtfully';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      totalScore
    };
  }

  validatePHQ9Responses(responses) {
    const errors = {};
    let totalScore = 0;

    // Validate each response
    for (let i = 0; i < 9; i++) {
      const response = responses[i];
      if (!response) {
        errors[`question_${i + 1}`] = `Question ${i + 1} is required`;
        continue;
      }

      const value = parseInt(response);
      if (isNaN(value) || value < 0 || value > 3) {
        errors[`question_${i + 1}`] = `Invalid response for question ${i + 1}`;
      }
      totalScore += value;
    }

    // Validate total score
    if (totalScore > 27) {
      errors.totalScore = 'Total score cannot exceed 27';
    }

    // Validate suicidal ideation severity
    const suicidalResponse = parseInt(responses[8] || '0');
    if (suicidalResponse >= 2) {
      errors.suicidalIdeation = 'Please contact your healthcare provider immediately if you are having thoughts of self-harm';
    }

    // Validate functional impairment
    const functionalImpairment = parseInt(responses[0] || '0') + parseInt(responses[1] || '0');
    if (functionalImpairment >= 4) {
      errors.functionalImpairment = 'Your responses suggest significant functional impairment. Please discuss this with your healthcare provider.';
    }

    // Validate response patterns
    const allSameResponse = Object.values(responses).every((val, _, arr) => val === arr[0]);
    if (allSameResponse) {
      errors.responsePattern = 'Please ensure you are answering each question thoughtfully';
    }

    // Calculate severity level
    let severityLevel = 'Minimal';
    if (totalScore <= 4) severityLevel = 'Minimal';
    else if (totalScore <= 9) severityLevel = 'Mild';
    else if (totalScore <= 14) severityLevel = 'Moderate';
    else if (totalScore <= 19) severityLevel = 'Moderately Severe';
    else severityLevel = 'Severe';

    if (severityLevel === 'Moderately Severe' || severityLevel === 'Severe') {
      errors.severityLevel = `Your responses indicate ${severityLevel.toLowerCase()} depression. Please discuss this with your healthcare provider.`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      totalScore,
      severityLevel
    };
  }
}

// Form-specific validation functions
export const PatientIntakeValidation = {
  validateForm(formData) {
    const errors = {};
    
    // Full Legal Name (required, 2-50 characters, letters and spaces only)
    if (!formData.fullLegalName?.trim()) {
      errors.fullLegalName = 'Full Legal Name is required';
    } else if (!/^[a-zA-Z\s\-']{2,50}$/.test(formData.fullLegalName)) {
      errors.fullLegalName = 'Full Legal Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
    }
    
    // Consultation Date (required, cannot be in past)
    if (!formData.date) {
      errors.date = 'Consultation Date is required';
    } else {
      const consultationDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      consultationDate.setHours(0, 0, 0, 0);
      if (consultationDate < today) {
        errors.date = 'Consultation Date cannot be in the past';
      }
    }
    
    // Phone (required, valid format with international support)
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (e.g., (123) 456-7890 or +1-123-456-7890)';
      }
    }
    
    // Email (required, valid format with disposable email check)
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      } else {
        // Check for common disposable email domains
        const disposableDomains = ['tempmail.com', 'throwawaymail.com', 'mailinator.com'];
        const domain = formData.email.split('@')[1].toLowerCase();
        if (disposableDomains.includes(domain)) {
          errors.email = 'Please use a valid email address';
        }
      }
    }
    
    // Address (required, 5-200 characters, allows PO Box and unit numbers)
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    } else {
      const addressRegex = /^[a-zA-Z0-9\s,.#-]+(?:[A-Za-z0-9\s,.#-]*[A-Za-z0-9])?$/;
      if (!addressRegex.test(formData.address.trim()) || formData.address.length < 5 || formData.address.length > 200) {
        errors.address = 'Please enter a valid address (5-200 characters)';
      }
    }
    
    // City, State, ZIP (required, more flexible format)
    if (!formData.cityStateZip?.trim()) {
      errors.cityStateZip = 'City, State, ZIP is required';
    } else {
      const cityStateZipRegex = /^[A-Za-z\s]+(?:,\s*[A-Za-z]{2}\s*\d{5}(?:-\d{4})?)?$/;
      if (!cityStateZipRegex.test(formData.cityStateZip.trim())) {
      errors.cityStateZip = 'Please enter in format: City, State ZIP (e.g., New York, NY 10001)';
      }
    }
    
    // Age (required, 0-120)
    if (!formData.age?.trim()) {
      errors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 120) {
        errors.age = 'Age must be between 0 and 120';
      }
    }
    
    // Date of Birth (required, not future, valid age)
    if (!formData.dob) {
      errors.dob = 'Date of Birth is required';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const minAge = 0;
      const maxAge = 120;
      
      if (dob > today) {
        errors.dob = 'Date of Birth cannot be in the future';
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
        
        if (adjustedAge < minAge || adjustedAge > maxAge) {
          errors.dob = `Age must be between ${minAge} and ${maxAge} years`;
        }
      }
    }
    
    // SSN (optional, valid format if provided)
    if (formData.ssn?.trim()) {
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      const cleanSSN = formData.ssn.replace(/\D/g, '');
      if (!ssnRegex.test(formData.ssn.trim()) || cleanSSN.length !== 9) {
        errors.ssn = 'Please enter a valid SSN (e.g., 123-45-6789)';
      }
    }
    
    // Spouse SSN (optional, valid format if provided)
    if (formData.spouseSsn?.trim()) {
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      const cleanSSN = formData.spouseSsn.replace(/\D/g, '');
      if (!ssnRegex.test(formData.spouseSsn.trim()) || cleanSSN.length !== 9) {
        errors.spouseSsn = 'Please enter a valid Spouse SSN (e.g., 123-45-6789)';
      }
    }
    
    // Gender (required)
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    // Active Duty Service Member (required)
    if (!formData.activeDutyServiceMember) {
      errors.activeDutyServiceMember = 'Active Duty Service Member status is required';
    }
    
    // Spouse Age (optional, valid if provided)
    if (formData.spouseAge?.trim()) {
      const spouseAge = parseInt(formData.spouseAge);
      if (isNaN(spouseAge) || spouseAge < 0 || spouseAge > 120) {
        errors.spouseAge = 'Spouse Age must be between 0 and 120';
      }
    }
    
    // Spouse DOB (optional, not future if provided)
    if (formData.spouseDob) {
      const spouseDob = new Date(formData.spouseDob);
      const today = new Date();
      if (spouseDob > today) {
      errors.spouseDob = 'Spouse Date of Birth cannot be in the future';
      }
    }
    
    // Emergency Contact Phone (optional, valid format if provided)
    if (formData.emergencyContactPhone?.trim()) {
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = 'Please enter a valid emergency contact phone number';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validatePatientIntakeForm(formData) {
    const errors = {};
    let isValid = true;

    // Validate required fields
    const requiredFields = {
      fullLegalName: 'Full Legal Name',
      age: 'Age',
      dob: 'Date of Birth',
      gender: 'Gender',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      cityStateZip: 'City, State, Zip'
    };

    // Check required fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      const validation = FormValidator.validateRequired(formData[field], label);
      if (!validation.isValid) {
        errors[field] = validation.error;
        isValid = false;
      }
    });

    // Validate email if provided
    if (formData.email) {
      const emailValidation = FormValidator.validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
        isValid = false;
      }
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = FormValidator.validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
        isValid = false;
      }
    }

    // Validate age if provided
    if (formData.age) {
      const ageValidation = FormValidator.validateAge(formData.age);
      if (!ageValidation.isValid) {
        errors.age = ageValidation.error;
        isValid = false;
      }
    }

    // Validate date of birth if provided
    if (formData.dob) {
      const dobValidation = FormValidator.validateDateOfBirth(formData.dob);
      if (!dobValidation.isValid) {
        errors.dob = dobValidation.error;
        isValid = false;
      }
    }

    // Validate address if provided
    if (formData.address) {
      const addressValidation = FormValidator.validateAddress(formData.address);
      if (!addressValidation.isValid) {
        errors.address = addressValidation.error;
        isValid = false;
      }
    }

    // Validate city, state, zip if provided
    if (formData.cityStateZip) {
      const cityStateZipValidation = FormValidator.validateCityStateZip(formData.cityStateZip);
      if (!cityStateZipValidation.isValid) {
        errors.cityStateZip = cityStateZipValidation.error;
        isValid = false;
      }
    }

    // Validate gender if provided
    if (formData.gender) {
      const genderValidation = FormValidator.validateGender(formData.gender);
      if (!genderValidation.isValid) {
        errors.gender = genderValidation.error;
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  validateMedicalHistoryForm(formData) {
    const errors = {};
    const sections = {
      conditions: 'Medical Conditions',
      suicidal: 'Suicidal History',
      allergies: 'Allergies',
      family: 'Family History',
      signature: 'Signature'
    };

    // Validate medical conditions
    const selectedConditions = Object.entries(formData.medicalConditions || {})
      .filter(([_, isSelected]) => isSelected)
      .map(([condition]) => condition);

    if (selectedConditions.length === 0) {
      errors.medicalConditions = `${sections.conditions}: Please select at least one condition or mark 'None'`;
    } else if (selectedConditions.length > 20) {
      errors.medicalConditions = `${sections.conditions}: You cannot select more than 20 conditions`;
    }

    // Check for mutually exclusive conditions
    const mutuallyExclusivePairs = [
      ['HIGH BLOOD PRESSURE', 'LOW BLOOD PRESSURE'],
      ['WEIGHT LOSS/GAIN', 'APPETITE PROBLEMS']
    ];

    for (const [condition1, condition2] of mutuallyExclusivePairs) {
      if (formData.medicalConditions?.[condition1] && formData.medicalConditions?.[condition2]) {
        errors.medicalConditions = `${sections.conditions}: ${condition1} and ${condition2} cannot be selected together`;
      }
    }

    // Validate suicidal history
    if (!formData.suicidalThoughts) {
      errors.suicidalThoughts = `${sections.suicidal}: Please indicate if you have had suicidal thoughts`;
    }
    if (!formData.attempts) {
      errors.attempts = `${sections.suicidal}: Please indicate if you have had any attempts`;
    }

    // Validate suicidal explanation if either thoughts or attempts are 'Yes'
    if ((formData.suicidalThoughts === 'Yes' || formData.attempts === 'Yes') && formData.suicidalExplanation) {
      const explanation = formData.suicidalExplanation.trim();
      if (explanation.length < 10) {
        errors.suicidalExplanation = `${sections.suicidal}: Please provide more details about your suicidal history`;
      } else if (explanation.length > 1000) {
        errors.suicidalExplanation = `${sections.suicidal}: Explanation cannot exceed 1000 characters`;
      }
    }

    // Validate allergies
    if (!formData.allergies?.trim()) {
      errors.allergies = `${sections.allergies}: Please list any allergies or indicate 'None'`;
    } else {
      const allergies = formData.allergies.split(',').map(a => a.trim());
      
      // Check for duplicates
      const uniqueAllergies = new Set(allergies);
      if (uniqueAllergies.size !== allergies.length) {
        errors.allergies = `${sections.allergies}: Please remove duplicate allergies`;
      }

      // Check for maximum number of allergies
      if (allergies.length > 20) {
        errors.allergies = `${sections.allergies}: You cannot list more than 20 allergies`;
      }

      // Validate each allergy format
      for (const allergy of allergies) {
        if (allergy.length < 2 || allergy.length > 50) {
          errors.allergies = `${sections.allergies}: Each allergy must be between 2 and 50 characters`;
          break;
        }
        if (!/^[a-zA-Z0-9\s\-']+$/.test(allergy)) {
          errors.allergies = `${sections.allergies}: Allergies can only contain letters, numbers, spaces, hyphens, and apostrophes`;
          break;
        }
      }
    }

    // Validate family history
    if (!formData.familyHistory?.trim()) {
      errors.familyHistory = `${sections.family}: Please provide family medical history or indicate 'None'`;
    } else {
      const familyHistory = formData.familyHistory.trim();
      
      if (familyHistory.length < 10) {
        errors.familyHistory = `${sections.family}: Please provide more details about your family medical history`;
      } else if (familyHistory.length > 2000) {
        errors.familyHistory = `${sections.family}: Family history cannot exceed 2000 characters`;
      }

      // Validate for common medical terms
      const medicalTerms = ['diabetes', 'heart disease', 'cancer', 'hypertension', 'stroke'];
      const hasMedicalTerms = medicalTerms.some(term => 
        familyHistory.toLowerCase().includes(term)
      );
      
      if (!hasMedicalTerms && familyHistory.toLowerCase() !== 'none') {
        errors.familyHistory = `${sections.family}: Please include specific medical conditions in your family history`;
      }
    }

    // Validate signature
    if (!formData.signature?.trim()) {
      errors.signature = `${sections.signature}: Please provide your signature to authorize this form`;
    } else {
      const signature = formData.signature.trim();
      if (signature.length < 3 || signature.length > 100) {
        errors.signature = `${sections.signature}: Signature must be between 3 and 100 characters`;
      }
      if (!/^[a-zA-Z\s\-']+$/.test(signature)) {
        errors.signature = `${sections.signature}: Signature can only contain letters, spaces, hyphens, and apostrophes`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validatePreCertMedListForm(formData) {
    const errors = {};
    const sections = {
      medications: 'Medications',
      details: 'Medication Details'
    };

    // Validate at least one medication is selected
    if (!formData.medications?.length) {
      errors.medications = `${sections.medications}: Please select at least one medication`;
    }

    // Validate medication details for each selected medication
    if (formData.medications?.length) {
      formData.medications.forEach(medication => {
        if (!formData.medicationDetails?.[medication]?.dosage?.trim()) {
          errors[`${medication}_dosage`] = `${sections.details}: Dosage is required for ${medication}`;
        }
        if (!formData.medicationDetails?.[medication]?.frequency?.trim()) {
          errors[`${medication}_frequency`] = `${sections.details}: Frequency is required for ${medication}`;
        }
      });
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
