import { useState, useEffect } from 'react';
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
  useEffect(() => {
    setNarrative(state.assessment.overallAssessment.narrative || '');
    setStrengths(state.assessment.overallAssessment.keyStrengths.join('\n') || '');
    setGaps(state.assessment.overallAssessment.keyGaps.join('\n') || '');
  }, [state.assessment.overallAssessment]);

  // Auto-save narrative, strengths, and gaps with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: 'UPDATE_OVERALL_ASSESSMENT',
        payload: {
          narrative,
          keyStrengths: strengths.split('\n').filter(s => s.trim()),
          keyGaps: gaps.split('\n').filter(g => g.trim()),
        },
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [narrative, strengths, gaps, dispatch]);

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
    if (!level) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
    const colors = {
      traditional: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      initial: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      advanced: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      optimal: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[level];
  };

  const getMaturityText = (level: MaturityLevel | null) => {
    if (!level) return 'Not Assessed';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getMaturityPercentage = (score: number | null) => {
    if (score === null) return 0;
    return (score / 4) * 100;
  };

  // Print/PDF function
  const handlePrint = () => {
    window.print();
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
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.75in;
          }
        }
      `}</style>

      <div className="space-y-6 print-content">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Assessment Summary
            </h1>
            <p className="text-gray-600">
              {state.assessment.metadata.customerName || 'Customer'} - Zero Trust Maturity Assessment
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handlePrint}
            className="no-print"
          >
            📄 Download PDF
          </Button>
        </div>

        {/* Progress Check */}
        {!progress.isComplete && (
          <Card className="p-6 bg-yellow-50 border-yellow-200 no-print">
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

        {/* Overall Score Card - Improved Design */}
        <Card className="p-8 bg-gradient-to-br from-aviatrix-orange via-orange-500 to-orange-600 text-white shadow-xl">
          <div className="text-center">
            <h2 className="text-lg font-heading font-medium mb-4 opacity-95">
              Overall Zero Trust Maturity Score
            </h2>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <div className="text-7xl font-bold mb-2">
                  {overallAverage !== null ? overallAverage.toFixed(1) : '—'}
                </div>
                <p className="text-sm opacity-90">
                  out of 4.0
                </p>
              </div>
              <div className="h-24 w-px bg-white opacity-30"></div>
              <div className="text-left">
                <div className="space-y-1 text-sm opacity-90">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>1.0 - Traditional</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>2.0 - Initial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>3.0 - Advanced</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>4.0 - Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Scores by Pillar - Redesigned */}
        <Card className="p-8">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-6">
            Detailed Maturity Analysis
          </h2>

          <div className="space-y-8">
            {/* Networks Pillar */}
            {state.assessment.metadata.cloudProviders.map(cloud => {
              const pillarKey = `networks-${cloud}`;
              const pillarData = pillarScores[pillarKey];
              if (!pillarData) return null;

              return (
                <div key={cloud} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <span className="text-2xl">🌐</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-semibold text-gray-900">
                            Networks - {cloud}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {pillarData.dimensions.filter(d => d.score !== null).length} of {pillarData.dimensions.length} dimensions assessed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-4xl font-bold text-aviatrix-orange">
                            {pillarData.average !== null ? pillarData.average.toFixed(1) : '—'}
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Average</p>
                        </div>
                        <div className="w-16 h-16">
                          <svg className="transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3"
                              strokeDasharray={`${getMaturityPercentage(pillarData.average)}, 100`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension Scores - Improved Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pillarData.dimensions.map((dim, idx) => {
                      const colors = getMaturityColor(dim.level);
                      return (
                        <div key={idx} className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-md`}>
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium text-gray-900 flex-1 leading-tight">{dim.name}</span>
                            {dim.score !== null && (
                              <span className="text-2xl font-bold ml-3 text-gray-900">{dim.score}.0</span>
                            )}
                          </div>
                          {dim.score !== null ? (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${getMaturityPercentage(dim.score)}%`,
                                    backgroundColor: dim.level === 'traditional' ? '#dc2626' : dim.level === 'initial' ? '#eab308' : dim.level === 'advanced' ? '#3b82f6' : '#16a34a'
                                  }}
                                ></div>
                              </div>
                              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${colors.text} ${colors.bg}`}>
                                {getMaturityText(dim.level)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Not assessed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Other Pillars */}
            {[
              { id: 'applicationsWorkloads', name: 'Applications & Workloads', icon: '🚀', bgColor: 'bg-purple-100' },
              { id: 'data', name: 'Data', icon: '🔒', bgColor: 'bg-green-100' },
              { id: 'crossCutting', name: 'Cross-Cutting Capabilities', icon: '🔗', bgColor: 'bg-indigo-100' },
            ].map(pillar => {
              const pillarData = pillarScores[pillar.id];
              if (!pillarData) return null;

              return (
                <div key={pillar.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 ${pillar.bgColor} rounded-lg`}>
                          <span className="text-2xl">{pillar.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-semibold text-gray-900">
                            {pillar.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {pillarData.dimensions.filter(d => d.score !== null).length} of {pillarData.dimensions.length} dimensions assessed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-4xl font-bold text-aviatrix-orange">
                            {pillarData.average !== null ? pillarData.average.toFixed(1) : '—'}
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Average</p>
                        </div>
                        <div className="w-16 h-16">
                          <svg className="transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3"
                              strokeDasharray={`${getMaturityPercentage(pillarData.average)}, 100`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pillarData.dimensions.map((dim, idx) => {
                      const colors = getMaturityColor(dim.level);
                      return (
                        <div key={idx} className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-md`}>
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium text-gray-900 flex-1 leading-tight">{dim.name}</span>
                            {dim.score !== null && (
                              <span className="text-2xl font-bold ml-3 text-gray-900">{dim.score}.0</span>
                            )}
                          </div>
                          {dim.score !== null ? (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${getMaturityPercentage(dim.score)}%`,
                                    backgroundColor: dim.level === 'traditional' ? '#dc2626' : dim.level === 'initial' ? '#eab308' : dim.level === 'advanced' ? '#3b82f6' : '#16a34a'
                                  }}
                                ></div>
                              </div>
                              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${colors.text} ${colors.bg}`}>
                                {getMaturityText(dim.level)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Not assessed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Overall Assessment */}
        <Card className="p-8">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">
            Executive Summary
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
            className="no-print-form"
          />
          {narrative && (
            <div className="mt-4 print-only hidden" style={{display: 'none'}}>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{narrative}</p>
            </div>
          )}
        </Card>

        {/* Key Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="p-8">
            <h2 className="text-xl font-heading font-semibold text-green-900 mb-4 flex items-center">
              <span className="mr-2">✓</span> Key Strengths
            </h2>
            <TextArea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="• Strong network segmentation on AWS&#10;• Advanced application identity&#10;• Good automation practices"
              rows={8}
              className="no-print-form"
            />
            <p className="text-xs text-gray-500 mt-2 no-print">One strength per line</p>
            {strengths && (
              <div className="mt-4 print-only hidden" style={{display: 'none'}}>
                {strengths.split('\n').filter(s => s.trim()).map((strength, i) => (
                  <div key={i} className="text-sm text-gray-800 mb-1">{strength}</div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-heading font-semibold text-orange-900 mb-4 flex items-center">
              <span className="mr-2">→</span> Key Gaps & Opportunities
            </h2>
            <TextArea
              value={gaps}
              onChange={(e) => setGaps(e.target.value)}
              placeholder="• Azure environment lacks maturity&#10;• Data governance needs improvement&#10;• Manual operations should be automated"
              rows={8}
              className="no-print-form"
            />
            <p className="text-xs text-gray-500 mt-2 no-print">One gap per line</p>
            {gaps && (
              <div className="mt-4 print-only hidden" style={{display: 'none'}}>
                {gaps.split('\n').filter(g => g.trim()).map((gap, i) => (
                  <div key={i} className="text-sm text-gray-800 mb-1">{gap}</div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 no-print">
          <Button
            variant="ghost"
            onClick={() => dispatch({
              type: 'NAVIGATE',
              payload: { currentPillar: 'crossCutting', currentDimension: 'teamCollaboration' },
            })}
          >
            ← Back to Assessment
          </Button>

          <div className="text-sm text-gray-500 italic">
            Summary auto-saves as you type
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print-form {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
