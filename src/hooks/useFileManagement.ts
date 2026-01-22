import { useCallback, useState } from 'react';
import { useAssessment } from '../contexts/AssessmentContext';
import {
  exportAssessmentToJSON,
  generateFileName,
  incrementVersion,
} from '../utils/assessment';
import { AssessmentError, ErrorType } from '../types/errors';
import type { AppError } from '../types/errors';
import { validateAssessmentSchema, validateFileSize } from '../utils/validation';

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export function useFileManagement() {
  const { state, dispatch } = useAssessment();
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveAssessment = useCallback(async () => {
    try {
      // Increment version
      dispatch({ type: 'INCREMENT_VERSION' });

      // Get updated assessment with new version
      const assessment = state.assessment;
      const newVersion = incrementVersion(assessment.fileVersion);

      const updatedAssessment = {
        ...assessment,
        fileVersion: newVersion,
      };

      // Generate JSON
      const json = exportAssessmentToJSON(updatedAssessment);

      // Generate filename
      const filename = generateFileName(
        assessment.metadata.customerName || 'Unnamed_Customer',
        assessment.metadata.assessmentDate,
        newVersion
      );

      // Save using Tauri or browser
      if (isTauri()) {
        // Use Tauri's save dialog
        // @ts-expect-error - Tauri API only available in Tauri environment
        const dialog = await import('@tauri-apps/api/dialog');
        // @ts-expect-error - Tauri API only available in Tauri environment
        const fs = await import('@tauri-apps/api/fs');

        const filePath = await dialog.save({
          defaultPath: filename,
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }]
        });

        if (filePath) {
          await fs.writeTextFile(filePath, json);
          dispatch({ type: 'MARK_CLEAN' });
          return { success: true, filename: filePath };
        } else {
          // User cancelled
          return { success: false, error: 'Save cancelled' };
        }
      } else {
        // Browser download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        dispatch({ type: 'MARK_CLEAN' });
        return { success: true, filename };
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
      return { success: false, error: (error as Error).message };
    }
  }, [state.assessment, dispatch]);

  const loadAssessment = useCallback(async (file: File | string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file size (only for File objects, not string paths)
      if (typeof file !== 'string') {
        validateFileSize(file);
      }

      // Read file
      const content = await readFileAsText(file);

      // Parse JSON with specific error handling
      let data: any;
      try {
        data = JSON.parse(content);
      } catch (parseError) {
        throw new AssessmentError(
          ErrorType.FILE_INVALID_JSON,
          'The selected file is not a valid JSON file. It may be corrupted or saved incorrectly.',
          `JSON parse error: ${(parseError as Error).message}`,
          [
            {
              label: 'Try Another File',
              action: () => {
                // Trigger file picker again
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.click();
              },
              isPrimary: true
            },
            {
              label: 'Cancel',
              action: () => {}
            }
          ]
        );
      }

      // Validate schema
      try {
        validateAssessmentSchema(data);
      } catch (validationError) {
        if (validationError instanceof AssessmentError) {
          // Add recovery options
          validationError.recoveryOptions = [
            {
              label: 'Try Another File',
              action: () => {
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.click();
              },
              isPrimary: true
            },
            {
              label: 'Start New Assessment',
              action: () => {
                // Reset to new assessment
                dispatch({ type: 'RESET_ASSESSMENT' });
              }
            },
            {
              label: 'Cancel',
              action: () => {}
            }
          ];
          throw validationError;
        }
        throw validationError;
      }

      // Success - load into state
      dispatch({ type: 'LOAD_ASSESSMENT', payload: data });
      setIsLoading(false);
      return { success: true };

    } catch (err) {
      // Convert to AppError if needed
      if (err instanceof AssessmentError) {
        setError({
          type: err.type,
          message: err.message,
          userMessage: err.userMessage,
          technicalDetails: err.technicalDetails,
          recoveryOptions: err.recoveryOptions
        });
      } else {
        setError({
          type: ErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred while loading the assessment.',
          userMessage: 'An unexpected error occurred. Please try again or contact support.',
          technicalDetails: err instanceof Error ? err.message : String(err),
          recoveryOptions: [
            {
              label: 'Try Again',
              action: () => {
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.click();
              },
              isPrimary: true
            },
            {
              label: 'Cancel',
              action: () => {}
            }
          ]
        });
      }
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, [dispatch]);

  const readFileAsText = async (file: File | string): Promise<string> => {
    // If it's a string path (from Tauri), read it directly
    if (typeof file === 'string') {
      if (isTauri()) {
        // @ts-expect-error - Tauri API only available in Tauri environment
        const fs = await import('@tauri-apps/api/fs');
        return await fs.readTextFile(file);
      }
      throw new Error('File path provided but not in Tauri environment');
    }

    // Otherwise it's a File object from browser
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const autoSave = useCallback(async () => {
    if (state.ui.isDirty) {
      return await saveAssessment();
    }
    return { success: true, filename: '' };
  }, [state.ui.isDirty, saveAssessment]);

  return {
    saveAssessment,
    loadAssessment,
    autoSave,
    error,
    setError,
    isLoading,
    clearError: () => setError(null)
  };
}
