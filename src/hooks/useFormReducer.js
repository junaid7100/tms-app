import { useReducer, useCallback } from 'react';

// Action types for form state management
const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  RESET_FORM: 'RESET_FORM',
  SET_PRESSED_STATE: 'SET_PRESSED_STATE',
};

// Form reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: action.value,
        },
      };
    
    case FORM_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };
    
    case FORM_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: '',
        },
      };
    
    case FORM_ACTIONS.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: Object.keys(state.errors).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {}),
      };
    
    case FORM_ACTIONS.RESET_FORM:
      return {
        ...state,
        fields: action.initialFields || state.initialFields,
        errors: Object.keys(state.errors).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {}),
      };
    
    case FORM_ACTIONS.SET_PRESSED_STATE:
      return {
        ...state,
        pressedStates: {
          ...state.pressedStates,
          [action.button]: action.pressed,
        },
      };
    
    default:
      return state;
  }
};

/**
 * Custom hook for managing form state with useReducer
 * Optimizes performance by reducing the number of state updates
 */
export const useFormReducer = (initialFields = {}, initialErrors = {}, initialPressedStates = {}) => {
  const initialState = {
    fields: initialFields,
    errors: initialErrors,
    pressedStates: initialPressedStates,
    initialFields,
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  // Memoized action creators to prevent unnecessary re-renders
  const setField = useCallback((field, value) => {
    dispatch({ type: FORM_ACTIONS.SET_FIELD, field, value });
  }, []);

  const setError = useCallback((field, error) => {
    dispatch({ type: FORM_ACTIONS.SET_ERROR, field, error });
  }, []);

  const clearError = useCallback((field) => {
    dispatch({ type: FORM_ACTIONS.CLEAR_ERROR, field });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: FORM_ACTIONS.CLEAR_ALL_ERRORS });
  }, []);

  const resetForm = useCallback((newInitialFields) => {
    dispatch({ type: FORM_ACTIONS.RESET_FORM, initialFields: newInitialFields });
  }, []);

  const setPressedState = useCallback((button, pressed) => {
    dispatch({ type: FORM_ACTIONS.SET_PRESSED_STATE, button, pressed });
  }, []);

  return {
    fields: state.fields,
    errors: state.errors,
    pressedStates: state.pressedStates,
    setField,
    setError,
    clearError,
    clearAllErrors,
    resetForm,
    setPressedState,
  };
}; 