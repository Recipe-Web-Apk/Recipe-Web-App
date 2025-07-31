/**
 * Centralized error handling utilities
 */

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_REQUIRED: 'Please log in to access this feature.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  RECIPE_NOT_FOUND: 'Recipe not found or you don\'t have permission to view it.',
  SAVE_FAILED: 'Failed to save recipe. Please try again.',
  DELETE_FAILED: 'Failed to delete recipe. Please try again.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  SEARCH_FAILED: 'Search failed. Please try again.',
  SIMILARITY_CHECK_FAILED: 'Failed to check for similar recipes.',
  AUTOFILL_FAILED: 'Failed to get suggestions.',
  RECOMMENDATION_FAILED: 'Failed to load recommendations.',
  LIKE_FAILED: 'Failed to update like status.',
  SAVE_RECIPE_FAILED: 'Failed to save recipe to your collection.',
  UNSAVE_RECIPE_FAILED: 'Failed to remove recipe from your collection.'
};

// Error types for different scenarios
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * Parse error response and return user-friendly message
 */
export function parseError(error) {
  if (!error) {
    return {
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      type: ERROR_TYPES.UNKNOWN
    };
  }

  // Network errors
  if (!error.response) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      type: ERROR_TYPES.NETWORK
    };
  }

  const { status, data } = error.response;

  // HTTP status code based errors
  switch (status) {
    case 400:
      return {
        message: data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
        type: ERROR_TYPES.VALIDATION
      };
    case 401:
      return {
        message: ERROR_MESSAGES.AUTH_REQUIRED,
        type: ERROR_TYPES.AUTH
      };
    case 403:
      return {
        message: ERROR_MESSAGES.PERMISSION_DENIED,
        type: ERROR_TYPES.PERMISSION
      };
    case 404:
      return {
        message: ERROR_MESSAGES.NOT_FOUND,
        type: ERROR_TYPES.NOT_FOUND
      };
    case 500:
    case 502:
    case 503:
      return {
        message: ERROR_MESSAGES.SERVER_ERROR,
        type: ERROR_TYPES.SERVER
      };
    default:
      return {
        message: data?.error || ERROR_MESSAGES.UNKNOWN_ERROR,
        type: ERROR_TYPES.UNKNOWN
      };
  }
}

/**
 * Handle API errors with consistent logging
 */
export function handleApiError(error, context = '') {
  const parsedError = parseError(error);
  
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error(`API Error [${context}]:`, {
      message: parsedError.message,
      type: parsedError.type,
      originalError: error
    });
  }

  return parsedError;
}

/**
 * Show user-friendly error notification
 */
export function showErrorNotification(error, context = '') {
  const parsedError = handleApiError(error, context);
  
  // You can integrate with a notification system here
  // For now, we'll use alert as a fallback
  if (typeof window !== 'undefined') {
    alert(parsedError.message);
  }
  
  return parsedError;
}

/**
 * Validate form fields and return errors
 */
export function validateForm(fields, rules) {
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];

    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[fieldName] = `${fieldRules.label || fieldName} is required`;
    } else if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[fieldName] = `${fieldRules.label || fieldName} must be at least ${fieldRules.minLength} characters`;
    } else if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[fieldName] = `${fieldRules.label || fieldName} must be no more than ${fieldRules.maxLength} characters`;
    } else if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[fieldName] = fieldRules.message || `${fieldRules.label || fieldName} format is invalid`;
    }
  });

  return errors;
} 