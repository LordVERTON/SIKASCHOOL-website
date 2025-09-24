/**
 * Input validation utilities for security and data integrity
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validates tutor ID
 */
export function validateTutorId(tutorId: string): ValidationResult {
  if (!tutorId || typeof tutorId !== 'string') {
    return { isValid: false, error: 'Tutor ID is required' };
  }

  const allowedIds = ['any', 'alix', 'nolwen', 'daniel', 'distel', 'walid', 'ruudy'];
  if (!allowedIds.includes(tutorId)) {
    return { isValid: false, error: 'Invalid tutor ID' };
  }

  return { isValid: true };
}

/**
 * Validates date string format
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Date is required' };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Check if date is not in the past
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) {
    return { isValid: false, error: 'Date cannot be in the past' };
  }

  return { isValid: true };
}

/**
 * Validates time string format (HH:MM)
 */
export function validateTime(timeString: string): ValidationResult {
  if (!timeString || typeof timeString !== 'string') {
    return { isValid: false, error: 'Time is required' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    return { isValid: false, error: 'Invalid time format' };
  }

  return { isValid: true };
}
