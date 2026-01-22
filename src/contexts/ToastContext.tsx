import { createContext, useState, useCallback } from 'react';
import { Toast } from '../components/common/Toast';
import type { ToastType } from '../components/common/Toast';

interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((config: ToastConfig) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, ...config }]);
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast({ type: 'success', message, duration });
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast({ type: 'error', message, duration });
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast({ type: 'warning', message, duration });
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast({ type: 'info', message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
