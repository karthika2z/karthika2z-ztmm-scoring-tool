import React, { useState } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import { calculateProgress } from '../../utils/assessment';
import frameworkData from '../../data/framework.json';
import { Card } from '../common/Card';
import { TextArea } from '../common/Input';
import { Button } from '../common/Button';
import type { MaturityLevel, PillarId, PillarAssessment } from '../../types';

export function SummaryScreen() {
  const { state, dispatch } = useAssessment();
  const progress = calculateProgress(state.assessment, frameworkData);

  const [narrative, setNarrative] = useState(state.assessment.overallAssessment.narrative || '');
  const [strengths, setStrengths] = useState(
    state.assessment.overallAssessment.keyStrengths.join('\n') || ''
  );
  const [gaps, setGaps] = useState(
    state.assessment.overallAssessment.keyGaps.join('\n') || ''
  );

  // Update form when overall assessment changes (e.g., after loading a file)
  React.useEffect(() => {
    setNarrative(state.assessment.overallAssessment.narrative || '');
    setStrengths(state.assessment.overallAssessment.keyStrengths.join('\n') || '');
    setGaps(state.assessment.overallAssessment.keyGaps.join('\n') || '');
  }, [state.assessment.overallAssessment]);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_OVERALL_ASSESSMENT',
      payload: {
        narrative,
        keyStrengths: strengths.split('\n').filter(s => s.trim()),
        keyGaps: gaps.split('\n').filter(g => g.trim()),
      },
    });
  };

  // Convert maturity level to numeric score (1-4)
  const getMaturityScore = (level: MaturityLevel | null): number | null => {
    if (!level) return null;
    const scores = {
      traditional: 1,
      initial: 2,
      advanced: 3,
      optimal: 4,
    };
    return scores[level];
  };

  const getMaturityColor = (level: MaturityLevel | null) => {
    if (!level) return 'bg-gray-200';
    const colors = {
      traditional: 'bg-maturity-traditional-DEFAULT',
      initial: 'bg-maturity-initial-DEFAULT',
      advanced: 'bg-maturity-advanced-DEFAULT',
      optimal: 'bg-maturity-optimal-DEFAULT',
    };
    return colors[level];
  };

  const getMaturityText = (level: MaturityLevel | null) => {
    if (!level) return 'Not Assessed';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };


  // Calculate scores for all dimensions
  const calculateScores = () => {
    const allScores: number[] = [];
    const pillarScores: Record<string, { dimensions: Array<{ name: string; score: number | null; level: MaturityLevel | null }>, average: number | null }> = {};

    // Networks pillar (cloud-specific)
    state.assessment.metadata.cloudProviders.forEach(cloud => {
      const cloudData = state.assessment.pillars.networks.cloudSpecific[cloud];
      if (cloudData) {
        const dimensions: Array<{ name: string; score: number | null; level: MaturityLevel | null }> = [];
        Object.entries(frameworkData.pillars.networks.dimensions).forEach(([dimId, dimData]) => {
          const dimAssessment = cloudData.dimensions[dimId];
          const score = dimAssessment?.maturityLevel ? getMaturityScore(dimAssessment.maturityLevel) : null;
          dimensions.push({
            name: dimData.name,
            score,
            level: dimAssessment?.maturityLevel || null,
          });
          if (score !== null) allScores.push(score);
        });
        const validScores = dimensions.map(d => d.score).filter((s): s is number => s !== null);
        pillarScores[`networks-${cloud}`] = {
          dimensions,
          average: validScores.length > 0 ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length : null,
        };
      }
    });

    // Other pillars
    const otherPillars: Array<{ id: PillarId; name: string }> = [
      { id: 'applicationsWorkloads', name: 'Applications & Workloads' },
      { id: 'data', name: 'Data' },
      { id: 'crossCutting', name: 'Cross-Cutting Capabilities' },
    ];

    otherPillars.forEach(({ id }) => {
      const pillarData = state.assessment.pillars[id] as PillarAssessment;
      const dimensions: Array<{ name: string; score: number | null; level: MaturityLevel | null }> = [];
      Object.entries(frameworkData.pillars[id].dimensions).forEach(([dimId, dimData]) => {
        const dimAssessment = pillarData.dimensions[dimId];
        const score = dimAssessment?.maturityLevel ? getMaturityScore(dimAssessment.maturityLevel) : null;
        dimensions.push({
          name: dimData.name,
          score,
          level: dimAssessment?.maturityLevel || null,
        });
        if (score !== null) allScores.push(score);
      });
      const validScores = dimensions.map(d => d.score).filter((s): s is number => s !== null);
      pillarScores[id] = {
        dimensions,
        average: validScores.length > 0 ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length : null,
      };
    });

    const overallAverage = allScores.length > 0 ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length : null;

    return { pillarScores, overallAverage };
  };

  const { pillarScores, overallAverage } = calculateScores();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          Assessment Summary
        </h1>
        <p className="text-gray-600">
          Review the overall maturity assessment and add your observations.
        </p>
      </div>

      {/* Progress Check */}
      {!progress.isComplete && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Assessment Incomplete
              </h3>
              <p className="text-sm text-gray-700">
                Some dimensions have not been assessed yet. Complete all dimensions for the most accurate results.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Progress: {progress.overallPercentage}% ({progress.pillars.reduce((sum, p) => sum + p.completedDimensions, 0)}/
                {progress.pillars.reduce((sum, p) => sum + p.totalDimensions, 0)} dimensions)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Overall Score Card */}
      <Card className="p-8 bg-gradient-to-br from-aviatrix-orange to-orange-600 text-white">
        <div className="text-center">
          <h2 className="text-lg font-heading font-medium mb-2 opacity-90">
            Overall Maturity Score
          </h2>
          <div className="text-6xl font-bold mb-2">
            {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
          </div>
          <p className="text-sm opacity-90">
            out of 4.00 (1=Traditional, 2=Initial, 3=Advanced, 4=Optimal)
          </p>
        </div>
      </Card>

      {/* Detailed Scores by Pillar */}
      <Card className="p-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-6">
          Detailed Maturity Scores
        </h2>

        <div className="space-y-8">
          {/* Networks Pillar */}
          {state.assessment.metadata.cloudProviders.map(cloud => {
            const pillarKey = `networks-${cloud}`;
            const pillarData = pillarScores[pillarKey];
            if (!pillarData) return null;

            return (
              <div key={cloud} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl md:text-2xl">🌐</span>
                      <div>
                        <h3 className="text-base md:text-lg font-heading font-semibold text-gray-900">
                          Networks - {cloud}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          {pillarData.dimensions.filter(d => d.score !== null).length} of {pillarData.dimensions.length} dimensions assessed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center md:items-end md:text-right gap-2 md:flex-col">
                      <div className="text-2xl md:text-3xl font-bold text-aviatrix-orange">
                        {pillarData.average !== null ? pillarData.average.toFixed(2) : '—'}
                      </div>
                      <p className="text-xs text-gray-500">Average Score</p>
                    </div>
                  </div>
                </div>

                {/* Dimension Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 md:ml-11">
                  {pillarData.dimensions.map((dim, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{dim.name}</span>
                      <div className="flex items-center space-x-2">
                        {dim.score !== null ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">{dim.score}</span>
                            <span className={`text-xs px-2 py-1 rounded text-white ${getMaturityColor(dim.level)}`}>
                              {getMaturityText(dim.level)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Not assessed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Other Pillars */}
          {[
            { id: 'applicationsWorkloads', name: 'Applications & Workloads', icon: '🚀' },
            { id: 'data', name: 'Data', icon: '🔒' },
            { id: 'crossCutting', name: 'Cross-Cutting Capabilities', icon: '🔗' },
          ].map(pillar => {
            const pillarData = pillarScores[pillar.id];
            if (!pillarData) return null;

            return (
              <div key={pillar.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl md:text-2xl">{pillar.icon}</span>
                      <div>
                        <h3 className="text-base md:text-lg font-heading font-semibold text-gray-900">
                          {pillar.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          {pillarData.dimensions.filter(d => d.score !== null).length} of {pillarData.dimensions.length} dimensions assessed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center md:items-end md:text-right gap-2 md:flex-col">
                      <div className="text-2xl md:text-3xl font-bold text-aviatrix-orange">
                        {pillarData.average !== null ? pillarData.average.toFixed(2) : '—'}
                      </div>
                      <p className="text-xs text-gray-500">Average Score</p>
                    </div>
                  </div>
                </div>

                {/* Dimension Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 md:ml-11">
                  {pillarData.dimensions.map((dim, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{dim.name}</span>
                      <div className="flex items-center space-x-2">
                        {dim.score !== null ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">{dim.score}</span>
                            <span className={`text-xs px-2 py-1 rounded text-white ${getMaturityColor(dim.level)}`}>
                              {getMaturityText(dim.level)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Not assessed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Overall Assessment */}
      <Card className="p-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
          Overall Assessment
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Provide your observations and key findings from the assessment.
        </p>

        <TextArea
          label="Assessment Narrative"
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Summarize the customer's overall Zero Trust maturity, highlighting patterns, themes, and notable observations across pillars..."
          rows={6}
        />
      </Card>

      {/* Key Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-8">
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
            Key Strengths
          </h2>
          <TextArea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="• Strong network segmentation on AWS&#10;• Advanced application identity&#10;• Good automation practices"
            rows={8}
          />
          <p className="text-xs text-gray-500 mt-2">One strength per line</p>
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
            Key Gaps & Opportunities
          </h2>
          <TextArea
            value={gaps}
            onChange={(e) => setGaps(e.target.value)}
            placeholder="• Azure environment lacks maturity&#10;• Data governance needs improvement&#10;• Manual operations should be automated"
            rows={8}
          />
          <p className="text-xs text-gray-500 mt-2">One gap per line</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={() => dispatch({
            type: 'NAVIGATE',
            payload: { currentPillar: 'crossCutting', currentDimension: 'teamCollaboration' },
          })}
        >
          ← Back to Assessment
        </Button>

        <Button
          variant="primary"
          onClick={handleSave}
        >
          Save Summary
        </Button>
      </div>
    </div>
  );
}
