// Core type definitions for the ZTMM Assessment Tool

export type MaturityLevel = 'traditional' | 'initial' | 'advanced' | 'optimal';

export type CloudProvider = 'AWS' | 'Azure' | 'GCP' | 'OCI' | 'Other';

export type PillarId = 'networks' | 'applicationsWorkloads' | 'data' | 'crossCutting';

// Framework content types
export interface MaturityLevelDefinition {
  level: MaturityLevel;
  name: string;
  description: string;
  indicators: string[];
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  maturityLevels: Record<MaturityLevel, MaturityLevelDefinition>;
}

export interface Pillar {
  id: PillarId;
  name: string;
  description: string;
  icon: string;
  cloudSpecific: boolean;
  dimensions: Record<string, Dimension>;
}

export interface Framework {
  schemaVersion: string;
  pillars: Record<PillarId, Pillar>;
}

// Question types
export interface Question {
  id: string;
  question: string;
  purpose: string;
}

export interface QuestionBank {
  schemaVersion: string;
  questions: Record<PillarId, Record<string, Question[]>>;
  listeningGuidance: Record<PillarId, Record<string, Record<MaturityLevel, string>>>;
}

// Assessment data types
export interface DimensionAssessment {
  maturityLevel: MaturityLevel | null;
  notes?: string;
  timestamp?: string;
}

export interface MaturityScore {
  calculated: MaturityLevel | null;
  final: MaturityLevel | null;
  overridden: boolean;
}

export interface NetworkPillarAssessment {
  cloudSpecific: Record<CloudProvider, {
    dimensions: Record<string, DimensionAssessment>;
    pillarMaturity: MaturityScore;
  }>;
  overallNotes?: string;
}

export interface PillarAssessment {
  dimensions: Record<string, DimensionAssessment>;
  pillarMaturity: MaturityScore;
  notes?: string;
}

export interface AssessmentMetadata {
  customerName: string;
  industry?: string;
  assessmentDate: string;
  salesEngineer?: string;
  cloudProviders: CloudProvider[];
  additionalNotes?: string;
}

export interface ChangeHistoryEntry {
  timestamp: string;
  fileVersion: string;
  action: 'created' | 'updated';
  changedFields?: string[];
}

export interface AssessmentData {
  assessmentId: string;
  fileVersion: string;
  schemaVersion: string;
  metadata: AssessmentMetadata;
  pillars: {
    networks: NetworkPillarAssessment;
    applicationsWorkloads: PillarAssessment;
    data: PillarAssessment;
    crossCutting: PillarAssessment;
  };
  overallAssessment: {
    narrative: string;
    keyStrengths: string[];
    keyGaps: string[];
  };
  createdAt: string;
  lastModified: string;
  changeHistory: ChangeHistoryEntry[];
}

// UI State types
export interface NavigationState {
  currentPillar: PillarId | 'setup' | 'summary' | 'interview';
  currentDimension?: string;
  currentCloud?: CloudProvider;
}

export interface UIState {
  navigation: NavigationState;
  isDirty: boolean;
  lastSaved?: string;
  sidebarCollapsed: boolean;
}

// Complete application state
export interface AppState {
  assessment: AssessmentData;
  ui: UIState;
}

// Action types for reducer
export type AssessmentAction =
  | { type: 'LOAD_ASSESSMENT'; payload: AssessmentData }
  | { type: 'UPDATE_METADATA'; payload: Partial<AssessmentMetadata> }
  | { type: 'UPDATE_DIMENSION'; payload: { pillarId: PillarId; dimensionId: string; cloudProvider?: CloudProvider; data: Partial<DimensionAssessment> } }
  | { type: 'UPDATE_PILLAR_MATURITY'; payload: { pillarId: PillarId; cloudProvider?: CloudProvider; maturity: MaturityScore } }
  | { type: 'UPDATE_OVERALL_ASSESSMENT'; payload: Partial<AssessmentData['overallAssessment']> }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN' }
  | { type: 'NAVIGATE'; payload: NavigationState }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESET_ASSESSMENT' }
  | { type: 'INCREMENT_VERSION' };

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// File management types
export interface ExportOptions {
  includeMetadata?: boolean;
  pretty?: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: AssessmentData;
  error?: string;
}

// PDF generation types
export interface PDFGenerationOptions {
  includeAllDetails?: boolean;
  includeAppendix?: boolean;
}

// Completion status types
export type CompletionStatus = 'complete' | 'in-progress' | 'pending';

export interface DimensionCompletionStatus {
  dimensionId: string;
  status: CompletionStatus;
}

export interface PillarCompletionStatus {
  pillarId: PillarId;
  completedDimensions: number;
  totalDimensions: number;
  status: CompletionStatus;
}

export interface AssessmentProgress {
  pillars: PillarCompletionStatus[];
  overallPercentage: number;
  isComplete: boolean;
}
