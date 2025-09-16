/**
 * Secure localStorage utilities with error handling
 */

/**
 * Safely sets an item in localStorage
 */
export function setStorageItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Failed to set localStorage item:', error);
    return false;
  }
}

/**
 * Safely gets an item from localStorage
 */
export function getStorageItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') {
      return null; // Server-side rendering
    }
    
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to get localStorage item:', error);
    return null;
  }
}

/**
 * Safely removes an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering
    }
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove localStorage item:', error);
    return false;
  }
}

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  SELECTED_TUTOR: 'selectedTutor',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
