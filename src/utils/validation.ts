import { AssessmentError, ErrorType } from '../types/errors';

/**
 * Validates the schema of assessment data imported from JSON
 */
export const validateAssessmentSchema = (data: any): void => {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    throw new AssessmentError(
      ErrorType.FILE_INVALID_JSON,
      'The file does not contain valid assessment data.',
      'Data is not an object'
    );
  }

  // Check required top-level fields
  const requiredFields = ['assessmentId', 'metadata', 'pillars', 'schemaVersion'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    throw new AssessmentError(
      ErrorType.SCHEMA_VALIDATION_FAILED,
      'The assessment file is missing required information.',
      `Missing fields: ${missingFields.join(', ')}`
    );
  }

  // Check schema version compatibility
  const currentVersion = '1.0';
  if (data.schemaVersion !== currentVersion) {
    throw new AssessmentError(
      ErrorType.SCHEMA_VERSION_MISMATCH,
      `This assessment was created with version ${data.schemaVersion}. Current version is ${currentVersion}.`,
      `Schema version mismatch: ${data.schemaVersion} vs ${currentVersion}`
    );
  }

  // Validate metadata
  if (!data.metadata?.customerName) {
    throw new AssessmentError(
      ErrorType.SCHEMA_VALIDATION_FAILED,
      'The assessment file is missing customer information.',
      'metadata.customerName is required'
    );
  }

  // Validate pillars structure
  const requiredPillars = ['networks', 'applicationsWorkloads', 'data', 'crossCutting'];
  const missingPillars = requiredPillars.filter(pillar => !(pillar in data.pillars));

  if (missingPillars.length > 0) {
    throw new AssessmentError(
      ErrorType.SCHEMA_VALIDATION_FAILED,
      'The assessment file has an incomplete structure.',
      `Missing pillars: ${missingPillars.join(', ')}`
    );
  }
};

/**
 * Validates file size before processing
 */
export const validateFileSize = (file: File): void => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  if (file.size > MAX_FILE_SIZE) {
    throw new AssessmentError(
      ErrorType.FILE_TOO_LARGE,
      `The file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`,
      `File size: ${file.size} bytes`
    );
  }
};

/**
 * Validates customer name for form input
 */
export const validateCustomerName = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return 'Customer name is required';
  }
  if (name.trim().length < 2) {
    return 'Customer name must be at least 2 characters';
  }
  if (!/[a-zA-Z]/.test(name)) {
    return 'Customer name must contain letters';
  }
  return undefined;
};

/**
 * Validates cloud provider selection
 */
export const validateCloudProviders = (providers: string[]): string | undefined => {
  if (providers.length === 0) {
    return 'Please select at least one cloud provider';
  }
  return undefined;
};
