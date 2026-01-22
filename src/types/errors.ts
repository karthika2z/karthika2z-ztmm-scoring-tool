// Error type definitions for comprehensive error handling

export const ErrorType = {
  FILE_INVALID_JSON: 'FILE_INVALID_JSON',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  SCHEMA_VERSION_MISMATCH: 'SCHEMA_VERSION_MISMATCH',
  SCHEMA_VALIDATION_FAILED: 'SCHEMA_VALIDATION_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface RecoveryOption {
  label: string;
  action: () => void;
  isPrimary?: boolean;
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  recoveryOptions?: RecoveryOption[];
}

export class AssessmentError extends Error {
  public type: ErrorType;
  public userMessage: string;
  public technicalDetails?: string;
  public recoveryOptions?: RecoveryOption[];

  constructor(
    type: ErrorType,
    userMessage: string,
    technicalDetails?: string,
    recoveryOptions?: RecoveryOption[]
  ) {
    super(userMessage);
    this.name = 'AssessmentError';
    this.type = type;
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
    this.recoveryOptions = recoveryOptions;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, AssessmentError);
    }
  }
}
