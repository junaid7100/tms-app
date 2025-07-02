class ValidationService {
  // Email validation with proper error messages
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    // Trim whitespace
    const trimmedEmail = email.trim();
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    return { isValid: true, message: '' };
  }

  // Phone number validation
  static validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    // Remove all non-numeric characters
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if the cleaned phone number has a valid length
    if (cleanedPhone.length < 10) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }

    return { isValid: true, message: '' };
  }

  // Required field validation
  static validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
      return { 
        isValid: false, 
        message: `${fieldName} is required` 
      };
    }
    return { isValid: true, message: '' };
  }

  // Date validation
  static validateDate(date) {
    if (!date) {
      return { isValid: false, message: 'Date is required' };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, message: 'Please enter a valid date' };
    }

    return { isValid: true, message: '' };
  }

  // Number validation
  static validateNumber(value, fieldName, options = {}) {
    const { min, max, required = true } = options;

    if (!value && !required) {
      return { isValid: true, message: '' };
    }

    if (!value && required) {
      return { isValid: false, message: `${fieldName} is required` };
    }

    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, message: `${fieldName} must be a number` };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, message: `${fieldName} must be at least ${min}` };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, message: `${fieldName} must be at most ${max}` };
    }

    return { isValid: true, message: '' };
  }

  // Validate form data
  static validateFormData(formData, validationRules) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData[field];
      let fieldError = '';

      // Apply each validation rule
      for (const rule of rules) {
        const { type, ...options } = rule;
        let validationResult;

        switch (type) {
          case 'required':
            validationResult = this.validateRequired(value, options.fieldName || field);
            break;
          case 'email':
            validationResult = this.validateEmail(value);
            break;
          case 'phone':
            validationResult = this.validatePhone(value);
            break;
          case 'date':
            validationResult = this.validateDate(value);
            break;
          case 'number':
            validationResult = this.validateNumber(value, options.fieldName || field, options);
            break;
          default:
            continue;
        }

        if (!validationResult.isValid) {
          fieldError = validationResult.message;
          isValid = false;
          break;
        }
      }

      if (fieldError) {
        errors[field] = fieldError;
      }
    }

    return { isValid, errors };
  }
}

export default ValidationService; 