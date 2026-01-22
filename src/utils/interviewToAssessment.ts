/**
 * Convert interview session responses to AssessmentData JSON
 */

import { format } from 'date-fns';
import type { InterviewSession } from '../types/interview';
import type { AssessmentData, MaturityLevel, PillarId, CloudProvider } from '../types';

/**
 * Generate complete assessment JSON from interview responses
 */
export function generateAssessmentFromInterview(session: InterviewSession): AssessmentData {
  const now = new Date().toISOString();

  // Initialize empty assessment structure
  const assessment: AssessmentData = {
    assessmentId: session.sessionId,
    fileVersion: 'v1',
    schemaVersion: '1.0',
    metadata: {
      customerName: session.customerName,
      assessmentDate: format(new Date(session.startedAt), 'yyyy-MM-dd'),
      cloudProviders: session.cloudProviders as CloudProvider[],
      additionalNotes: 'Generated from AI-powered interview mode'
    },
    pillars: {
      networks: {
        cloudSpecific: {} as Record<CloudProvider, { dimensions: Record<string, any>; pillarMaturity: any }>
      },
      applicationsWorkloads: {
        dimensions: {},
        pillarMaturity: {
          calculated: null,
          final: null,
          overridden: false
        }
      },
      data: {
        dimensions: {},
        pillarMaturity: {
          calculated: null,
          final: null,
          overridden: false
        }
      },
      crossCutting: {
        dimensions: {},
        pillarMaturity: {
          calculated: null,
          final: null,
          overridden: false
        }
      }
    },
    overallAssessment: {
      narrative: '',
      keyStrengths: [],
      keyGaps: []
    },
    createdAt: session.startedAt,
    lastModified: now,
    changeHistory: [
      {
        timestamp: session.startedAt,
        fileVersion: 'v1',
        action: 'created'
      }
    ]
  };

  // Initialize network pillar cloud-specific data
  session.cloudProviders.forEach(provider => {
    (assessment.pillars.networks.cloudSpecific as any)[provider] = {
      dimensions: {},
      pillarMaturity: {
        calculated: null,
        final: null,
        overridden: false
      }
    };
  });

  // Process each response and populate assessment
  Object.values(session.responses).forEach(response => {
    if (!response.detectedMaturityLevel) return;

    const questionId = response.questionId;
    const maturityLevel = response.detectedMaturityLevel as MaturityLevel;

    // Find the question to get pillar and dimension info
    const questionParts = questionId.split('-');
    const pillarId = questionParts[0];
    const dimensionId = questionParts.slice(1).join('-');

    if (pillarId === 'setup') return; // Skip setup questions

    const dimensionData = {
      maturityLevel,
      notes: response.transcript,
      timestamp: response.timestamp
    };

    // Handle networks pillar (cloud-specific)
    if (pillarId === 'networks') {
      session.cloudProviders.forEach(provider => {
        (assessment.pillars.networks.cloudSpecific as any)[provider].dimensions[dimensionId] = dimensionData;
      });
    }
    // Handle other pillars
    else if (pillarId in assessment.pillars) {
      const pillar = (assessment.pillars as any)[pillarId];
      if ('dimensions' in pillar) {
        pillar.dimensions[dimensionId] = dimensionData;
      }
    }
  });

  // Calculate pillar maturity levels
  calculatePillarMaturity(assessment);

  // Generate overall assessment narrative
  assessment.overallAssessment.narrative = generateNarrative(session);

  return assessment;
}

/**
 * Calculate pillar maturity levels based on dimension scores
 */
function calculatePillarMaturity(assessment: AssessmentData): void {
  // For each standard pillar
  (['applicationsWorkloads', 'data', 'crossCutting'] as PillarId[]).forEach(pillarId => {
    const pillar = assessment.pillars[pillarId];
    if ('dimensions' in pillar) {
      const levels = Object.values(pillar.dimensions)
        .map(d => d.maturityLevel)
        .filter(l => l !== null);

      if (levels.length > 0) {
        pillar.pillarMaturity.calculated = getMostCommonLevel(levels);
        pillar.pillarMaturity.final = pillar.pillarMaturity.calculated;
      }
    }
  });

  // For networks pillar (per cloud)
  Object.values(assessment.pillars.networks.cloudSpecific).forEach(cloudData => {
    const levels = Object.values(cloudData.dimensions)
      .map(d => d.maturityLevel)
      .filter(l => l !== null);

    if (levels.length > 0) {
      cloudData.pillarMaturity.calculated = getMostCommonLevel(levels);
      cloudData.pillarMaturity.final = cloudData.pillarMaturity.calculated;
    }
  });
}

/**
 * Get most common maturity level (mode)
 */
function getMostCommonLevel(levels: (MaturityLevel | null)[]): MaturityLevel | null {
  if (levels.length === 0) return null;

  const counts: Record<string, number> = {};
  levels.forEach(level => {
    if (level) {
      counts[level] = (counts[level] || 0) + 1;
    }
  });

  let maxCount = 0;
  let mostCommon: MaturityLevel | null = null;

  Object.entries(counts).forEach(([level, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = level as MaturityLevel;
    }
  });

  return mostCommon;
}

/**
 * Generate narrative summary from interview responses
 */
function generateNarrative(session: InterviewSession): string {
  const responseCount = Object.keys(session.responses).length;
  const maturityLevels = Object.values(session.responses)
    .map(r => r.detectedMaturityLevel)
    .filter(Boolean);

  const levelCounts: Record<string, number> = {};
  maturityLevels.forEach(level => {
    if (level) {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }
  });

  const dominantLevel = Object.entries(levelCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'initial';

  return `This assessment was generated from an AI-powered interview conducted on ${format(new Date(session.startedAt), 'MMMM d, yyyy')}. ${responseCount} questions were answered across all Zero Trust pillars. The analysis shows a predominant maturity level of "${dominantLevel}" across the organization's Zero Trust implementation.`;
}

/**
 * Export assessment to JSON file
 */
export function downloadAssessmentJSON(assessment: AssessmentData): void {
  const json = JSON.stringify(assessment, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `ZTMM_Assessment_${assessment.metadata.customerName.replace(/\s+/g, '_')}_${assessment.metadata.assessmentDate}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
