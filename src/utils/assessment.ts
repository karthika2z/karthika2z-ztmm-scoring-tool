import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type {
  AssessmentData,
  CloudProvider,
  MaturityLevel,
  PillarAssessment,
  NetworkPillarAssessment,
  MaturityScore,
  AssessmentProgress,
  PillarCompletionStatus,
  CompletionStatus,
} from '../types';

/**
 * Creates a new empty assessment with default values
 */
export function createEmptyAssessment(): AssessmentData {
  const now = new Date().toISOString();

  return {
    assessmentId: uuidv4(),
    fileVersion: 'v1',
    schemaVersion: '1.0',
    metadata: {
      customerName: '',
      assessmentDate: format(new Date(), 'yyyy-MM-dd'),
      cloudProviders: [],
    },
    pillars: {
      networks: createEmptyNetworkPillar([]),
      applicationsWorkloads: createEmptyPillar(),
      data: createEmptyPillar(),
      crossCutting: createEmptyPillar(),
    },
    overallAssessment: {
      narrative: '',
      keyStrengths: [],
      keyGaps: [],
    },
    createdAt: now,
    lastModified: now,
    changeHistory: [
      {
        timestamp: now,
        fileVersion: 'v1',
        action: 'created',
      },
    ],
  };
}

/**
 * Creates an empty network pillar based on selected cloud providers
 */
export function createEmptyNetworkPillar(cloudProviders: CloudProvider[]): NetworkPillarAssessment {
  const cloudSpecific = {} as NetworkPillarAssessment['cloudSpecific'];

  cloudProviders.forEach(provider => {
    cloudSpecific[provider] = {
      dimensions: {},
      pillarMaturity: {
        calculated: null,
        final: null,
        overridden: false,
      },
    };
  });

  return {
    cloudSpecific,
  };
}

/**
 * Creates an empty standard pillar
 */
export function createEmptyPillar(): PillarAssessment {
  return {
    dimensions: {},
    pillarMaturity: {
      calculated: null,
      final: null,
      overridden: false,
    },
  };
}

/**
 * Calculates the pillar maturity level based on dimension scores
 * Uses modal (most common) maturity level
 */
export function calculatePillarMaturity(dimensionScores: Record<string, MaturityLevel | null>): MaturityLevel | null {
  const scores = Object.values(dimensionScores).filter((s): s is MaturityLevel => s !== null);

  if (scores.length === 0) {
    return null;
  }

  // Count occurrences of each maturity level
  const counts: Record<MaturityLevel, number> = {
    traditional: 0,
    initial: 0,
    advanced: 0,
    optimal: 0,
  };

  scores.forEach(score => {
    counts[score]++;
  });

  // Find the most common (modal) maturity level
  let maxCount = 0;
  let modalLevel: MaturityLevel | null = null;

  (Object.entries(counts) as [MaturityLevel, number][]).forEach(([level, count]) => {
    if (count > maxCount) {
      maxCount = count;
      modalLevel = level;
    }
  });

  return modalLevel;
}

/**
 * Updates the calculated maturity for a pillar
 */
export function updatePillarMaturity(
  pillarAssessment: PillarAssessment
): MaturityScore {
  const dimensionScores: Record<string, MaturityLevel | null> = {};

  Object.entries(pillarAssessment.dimensions).forEach(([dimensionId, assessment]) => {
    dimensionScores[dimensionId] = assessment.maturityLevel;
  });

  const calculated = calculatePillarMaturity(dimensionScores);

  return {
    calculated,
    final: pillarAssessment.pillarMaturity.overridden
      ? pillarAssessment.pillarMaturity.final
      : calculated,
    overridden: pillarAssessment.pillarMaturity.overridden,
  };
}

/**
 * Calculates assessment progress and completion status
 */
export function calculateProgress(assessment: AssessmentData, framework: any): AssessmentProgress {
  const pillarProgress: PillarCompletionStatus[] = [];
  let totalDimensions = 0;
  let completedDimensions = 0;

  // Helper to check if a dimension is complete
  const isDimensionComplete = (assessment: any): boolean => {
    return assessment?.maturityLevel !== null && assessment?.maturityLevel !== undefined;
  };

  // Networks pillar (cloud-specific)
  const networkPillar = framework.pillars.networks;
  const networkDimensionCount = Object.keys(networkPillar.dimensions).length;
  const cloudProvidersCount = assessment.metadata.cloudProviders.length;
  const networkTotalDimensions = networkDimensionCount * cloudProvidersCount;

  let networkCompleted = 0;
  assessment.metadata.cloudProviders.forEach(provider => {
    const providerData = assessment.pillars.networks.cloudSpecific[provider];
    if (providerData) {
      Object.values(providerData.dimensions).forEach(dim => {
        if (isDimensionComplete(dim)) {
          networkCompleted++;
        }
      });
    }
  });

  totalDimensions += networkTotalDimensions;
  completedDimensions += networkCompleted;

  pillarProgress.push({
    pillarId: 'networks',
    completedDimensions: networkCompleted,
    totalDimensions: networkTotalDimensions,
    status: getStatusForPillar(networkCompleted, networkTotalDimensions),
  });

  // Other pillars
  const otherPillars: Array<'applicationsWorkloads' | 'data' | 'crossCutting'> = [
    'applicationsWorkloads',
    'data',
    'crossCutting',
  ];

  otherPillars.forEach(pillarId => {
    const pillarData = framework.pillars[pillarId];
    const dimensionCount = Object.keys(pillarData.dimensions).length;
    const assessmentPillar = assessment.pillars[pillarId];

    let completed = 0;
    Object.values(assessmentPillar.dimensions).forEach(dim => {
      if (isDimensionComplete(dim)) {
        completed++;
      }
    });

    totalDimensions += dimensionCount;
    completedDimensions += completed;

    pillarProgress.push({
      pillarId,
      completedDimensions: completed,
      totalDimensions: dimensionCount,
      status: getStatusForPillar(completed, dimensionCount),
    });
  });

  const overallPercentage = totalDimensions > 0
    ? Math.round((completedDimensions / totalDimensions) * 100)
    : 0;

  return {
    pillars: pillarProgress,
    overallPercentage,
    isComplete: completedDimensions === totalDimensions && totalDimensions > 0,
  };
}

/**
 * Determines the completion status for a pillar
 */
function getStatusForPillar(completed: number, total: number): CompletionStatus {
  if (completed === 0) return 'pending';
  if (completed === total) return 'complete';
  return 'in-progress';
}

/**
 * Increments the version number
 */
export function incrementVersion(currentVersion: string): string {
  const match = currentVersion.match(/v(\d+)/);
  if (!match) return 'v1';

  const num = parseInt(match[1], 10);
  return `v${num + 1}`;
}

/**
 * Generates a filename for the assessment export
 */
export function generateFileName(
  customerName: string,
  assessmentDate: string,
  currentVersion?: string
): string {
  // Sanitize customer name
  const sanitized = customerName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length

  // Format date
  const dateStr = assessmentDate;

  // Get version
  const version = currentVersion || 'v1';

  return `${sanitized}_ZTMM_Assessment_${dateStr}_${version}.json`;
}

/**
 * Validates an assessment data structure
 */
export function validateAssessment(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic structure validation
  if (!data.assessmentId) errors.push('Missing assessment ID');
  if (!data.schemaVersion) errors.push('Missing schema version');
  if (!data.metadata) errors.push('Missing metadata');
  if (!data.pillars) errors.push('Missing pillars');

  // Metadata validation
  if (data.metadata) {
    if (!data.metadata.customerName) errors.push('Customer name is required');
    if (!data.metadata.assessmentDate) errors.push('Assessment date is required');
    if (!Array.isArray(data.metadata.cloudProviders)) errors.push('Cloud providers must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Exports assessment data to JSON string
 */
export function exportAssessmentToJSON(assessment: AssessmentData, pretty = true): string {
  return JSON.stringify(assessment, null, pretty ? 2 : 0);
}

/**
 * Imports assessment data from JSON string
 */
export function importAssessmentFromJSON(jsonString: string): { success: boolean; data?: AssessmentData; error?: string } {
  try {
    const data = JSON.parse(jsonString);

    // Validate the data
    const validation = validateAssessment(data);

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid assessment data: ${validation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      data: data as AssessmentData,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse JSON: ${(error as Error).message}`,
    };
  }
}
