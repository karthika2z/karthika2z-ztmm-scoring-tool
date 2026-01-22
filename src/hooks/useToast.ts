import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

/**
 * Hook to access toast notifications
 *
 * @example
 * const toast = useToast();
 * toast.success('Assessment saved successfully!');
 * toast.error('Failed to load assessment');
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
