import { useState } from 'react';
import type { AppError } from '../../types/errors';
import { ErrorType } from '../../types/errors';
import { Button } from './Button';

interface ErrorModalProps {
  error: AppError | null;
  onClose: () => void;
  showTechnicalDetails?: boolean;
}

export function ErrorModal({
  error,
  onClose,
  showTechnicalDetails = false
}: ErrorModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.FILE_INVALID_JSON:
      case ErrorType.FILE_CORRUPTED:
        return '📄';
      case ErrorType.SCHEMA_VERSION_MISMATCH:
      case ErrorType.SCHEMA_VALIDATION_FAILED:
        return '⚠️';
      case ErrorType.NETWORK_ERROR:
        return '🌐';
      case ErrorType.STORAGE_QUOTA_EXCEEDED:
        return '💾';
      default:
        return '❌';
    }
  };

  const copyToClipboard = () => {
    const details = `
Error Type: ${error.type}
Message: ${error.message}
Technical Details: ${error.technicalDetails || 'N/A'}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(details);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <span className="text-3xl mr-3">{getErrorIcon()}</span>
          <h2 className="text-xl font-semibold text-gray-900 flex-1">
            Unable to Complete Action
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close error dialog"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* User-friendly message */}
          <p className="text-gray-700">{error.userMessage}</p>

          {/* Recovery options */}
          {error.recoveryOptions && error.recoveryOptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">What would you like to do?</p>
              <div className="space-y-2">
                {error.recoveryOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      option.action();
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-2 rounded-md border transition-colors ${
                      option.isPrimary
                        ? 'border-aviatrix-orange bg-aviatrix-orange text-white hover:bg-orange-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Technical details (collapsible) */}
          {showTechnicalDetails && error.technicalDetails && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <span className="mr-1">{showDetails ? '▼' : '▶'}</span>
                Technical Details
              </button>

              {showDetails && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 space-y-1">
                  <div><strong>Error Type:</strong> {error.type}</div>
                  <div><strong>Details:</strong> {error.technicalDetails}</div>
                  <button
                    onClick={copyToClipboard}
                    className="mt-2 text-aviatrix-orange hover:underline"
                  >
                    Copy error details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
