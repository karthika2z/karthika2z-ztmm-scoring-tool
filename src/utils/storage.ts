import { AssessmentError, ErrorType } from '../types/errors';

/**
 * Storage utility with error handling and backup mechanisms
 */
export const storage = {
  /**
   * Saves data to sessionStorage with localStorage backup
   */
  save: (key: string, data: any): void => {
    try {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(key, serialized);

      // Also save to localStorage as backup
      try {
        localStorage.setItem(`${key}-backup`, serialized);
      } catch (localError) {
        // LocalStorage failed, but sessionStorage succeeded - acceptable
        console.warn('LocalStorage backup failed:', localError);
      }
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        throw new AssessmentError(
          ErrorType.STORAGE_QUOTA_EXCEEDED,
          'Browser storage is full. Please clear some space or download your assessment now.',
          'Storage quota exceeded',
          [
            {
              label: 'Download Assessment Now',
              action: () => {
                // Trigger immediate download
                window.dispatchEvent(new CustomEvent('force-download'));
              },
              isPrimary: true
            },
            {
              label: 'Clear Browser Data',
              action: () => {
                // Show instructions
                window.open('chrome://settings/clearBrowserData', '_blank');
              }
            }
          ]
        );
      }
      throw error;
    }
  },

  /**
   * Loads data from sessionStorage with localStorage fallback
   */
  load: (key: string): any | null => {
    try {
      const data = sessionStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }

      // Try backup from localStorage
      const backup = localStorage.getItem(`${key}-backup`);
      if (backup) {
        console.info('Recovered from localStorage backup');
        return JSON.parse(backup);
      }

      return null;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  },

  /**
   * Clears data from both sessionStorage and localStorage
   */
  clear: (key: string): void => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(`${key}-backup`);
  }
};
