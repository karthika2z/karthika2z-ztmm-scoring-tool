import { useState, useEffect } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import { MaturitySelector } from './MaturitySelector';
import { InterviewQuestions } from './InterviewQuestions';
import { TextArea } from '../common/Input';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';
import frameworkData from '../../data/framework.json';
import questionsData from '../../data/questions.json';
import type { PillarId, MaturityLevel, PillarAssessment } from '../../types';

export function DimensionView() {
  const { state, dispatch } = useAssessment();
  const { navigation } = state.ui;
  const { currentPillar, currentDimension, currentCloud } = navigation;

  // Collapsible state for interview questions
  const [questionsExpanded, setQuestionsExpanded] = useState(true);

  if (!currentPillar || currentPillar === 'setup' || currentPillar === 'summary' || currentPillar === 'interview' || !currentDimension) {
    return null;
  }

  // Networks pillar requires a cloud provider
  if (currentPillar === 'networks' && !currentCloud) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
          Cloud Provider Required
        </h2>
        <p className="text-gray-600 mb-6">
          The Networks pillar assessment requires you to select at least one cloud provider in Setup.
        </p>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', payload: { currentPillar: 'setup' } })}
          className="btn-primary"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  const pillarData = frameworkData.pillars[currentPillar as PillarId];
  const dimensionData = (pillarData.dimensions as any)[currentDimension];

  if (!dimensionData) {
    return <div>Dimension not found</div>;
  }

  // Get current assessment data
  let currentAssessment: any;
  if (currentPillar === 'networks' && currentCloud) {
    currentAssessment = state.assessment.pillars.networks.cloudSpecific[currentCloud]?.dimensions[currentDimension] || {};
  } else {
    const pillar = state.assessment.pillars[currentPillar as PillarId] as PillarAssessment;
    currentAssessment = pillar.dimensions[currentDimension] || {};
  }

  const [selectedLevel, setSelectedLevel] = useState<MaturityLevel | null>(currentAssessment.maturityLevel || null);
  const [notes, setNotes] = useState(currentAssessment.notes || '');

  // Update local state when navigation changes or assessment data changes
  useEffect(() => {
    setSelectedLevel(currentAssessment.maturityLevel || null);
    setNotes(currentAssessment.notes || '');
  }, [currentPillar, currentDimension, currentCloud, currentAssessment.maturityLevel, currentAssessment.notes]);

  const handleLevelSelect = (level: MaturityLevel) => {
    setSelectedLevel(level);
    dispatch({
      type: 'UPDATE_DIMENSION',
      payload: {
        pillarId: currentPillar as PillarId,
        dimensionId: currentDimension,
        cloudProvider: currentCloud,
        data: {
          maturityLevel: level,
          notes,
        },
      },
    });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (selectedLevel) {
      dispatch({
        type: 'UPDATE_DIMENSION',
        payload: {
          pillarId: currentPillar as PillarId,
          dimensionId: currentDimension,
          cloudProvider: currentCloud,
          data: {
            maturityLevel: selectedLevel,
            notes: value,
          },
        },
      });
    }
  };

  // Get questions for this dimension
  const questions = (questionsData.questions as any)[currentPillar]?.[currentDimension] || [];
  const listeningGuidance = (questionsData.listeningGuidance as any)[currentPillar]?.[currentDimension];

  // Navigation functions
  const dimensionKeys = Object.keys(pillarData.dimensions);
  const currentIndex = dimensionKeys.indexOf(currentDimension);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === dimensionKeys.length - 1;

  const handlePrevious = () => {
    if (!isFirst) {
      const prevDimension = dimensionKeys[currentIndex - 1];
      dispatch({
        type: 'NAVIGATE',
        payload: {
          currentPillar,
          currentDimension: prevDimension,
          currentCloud,
        },
      });
    }
  };

  const handleNext = () => {
    if (!isLast) {
      const nextDimension = dimensionKeys[currentIndex + 1];
      dispatch({
        type: 'NAVIGATE',
        payload: {
          currentPillar,
          currentDimension: nextDimension,
          currentCloud,
        },
      });
    } else {
      // Last dimension of current section
      // For Networks pillar, check if there are more clouds to assess
      if (currentPillar === 'networks' && currentCloud) {
        const cloudProviders = state.assessment.metadata.cloudProviders;
        const currentCloudIndex = cloudProviders.indexOf(currentCloud);

        if (currentCloudIndex < cloudProviders.length - 1) {
          // Move to next cloud provider
          const nextCloud = cloudProviders[currentCloudIndex + 1];
          dispatch({
            type: 'NAVIGATE',
            payload: {
              currentPillar: 'networks',
              currentDimension: dimensionKeys[0], // First dimension
              currentCloud: nextCloud,
            },
          });
          return;
        }
      }

      // Move to next pillar or summary
      const pillars: (PillarId | 'summary')[] = ['networks', 'applicationsWorkloads', 'data', 'crossCutting', 'summary'];
      const pillarIndex = pillars.indexOf(currentPillar as PillarId);
      if (pillarIndex < pillars.length - 1) {
        const nextPillar = pillars[pillarIndex + 1];
        if (nextPillar === 'summary') {
          dispatch({
            type: 'NAVIGATE',
            payload: { currentPillar: 'summary' },
          });
        } else {
          const nextPillarData = frameworkData.pillars[nextPillar as PillarId];
          const firstDimension = Object.keys(nextPillarData.dimensions)[0];
          dispatch({
            type: 'NAVIGATE',
            payload: {
              currentPillar: nextPillar as PillarId,
              currentDimension: firstDimension,
            },
          });
        }
      } else {
        dispatch({
          type: 'NAVIGATE',
          payload: { currentPillar: 'summary' },
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{pillarData.icon}</span>
            <div>
              <p className="text-sm text-gray-500">
                {pillarData.name}
              </p>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                {dimensionData.name}
              </h1>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            Dimension {currentIndex + 1} of {dimensionKeys.length}
          </div>
        </div>
        <p className="text-gray-600">{dimensionData.description}</p>
      </div>

      {/* Top Navigation - Sticky */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirst}
          >
            ← Previous
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Progress</div>
            <div className="flex items-center space-x-2">
              {dimensionKeys.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 rounded-full ${
                    idx < currentIndex
                      ? 'bg-green-500'
                      : idx === currentIndex
                      ? 'bg-aviatrix-orange'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
          >
            {(() => {
              if (!isLast) {
                return 'Next Dimension →';
              }
              // Last dimension - check what's next
              if (currentPillar === 'networks' && currentCloud) {
                const cloudProviders = state.assessment.metadata.cloudProviders;
                const currentCloudIndex = cloudProviders.indexOf(currentCloud);
                if (currentCloudIndex < cloudProviders.length - 1) {
                  const nextCloud = cloudProviders[currentCloudIndex + 1];
                  return `Next Cloud (${nextCloud}) →`;
                }
              }
              return 'Next Pillar →';
            })()}
          </Button>
        </div>
      </div>

      {/* Cloud Provider Tabs for Networks Pillar */}
      {currentPillar === 'networks' && state.assessment.metadata.cloudProviders.length > 1 && (
        <div className="flex space-x-2 border-b border-gray-200">
          {state.assessment.metadata.cloudProviders.map(cloud => (
            <button
              key={cloud}
              onClick={() => {
                dispatch({
                  type: 'NAVIGATE',
                  payload: {
                    currentPillar,
                    currentDimension,
                    currentCloud: cloud,
                  },
                });
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                currentCloud === cloud
                  ? 'border-aviatrix-orange text-aviatrix-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {cloud}
              {state.assessment.pillars.networks.cloudSpecific[cloud]?.pillarMaturity.final && (
                <span className="ml-2 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Current Cloud Indicator for Networks */}
      {currentPillar === 'networks' && currentCloud && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-medium">Assessing:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {currentCloud}
          </span>
        </div>
      )}

      {/* PRIMARY: Maturity Level Selection (Largest, Most Prominent) */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4 border-l-4 border-aviatrix-orange">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
            Select Maturity Level
          </h2>
          <p className="text-gray-600">
            Based on the customer's responses, select the maturity level that best matches their current state.
          </p>
        </div>

        <MaturitySelector
          dimension={dimensionData}
          selectedLevel={selectedLevel}
          onSelect={handleLevelSelect}
        />
      </section>

      {/* SECONDARY: Interview Questions (Collapsible, Supporting) */}
      {questions.length > 0 && (
        <section className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setQuestionsExpanded(!questionsExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            type="button"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-heading font-semibold text-gray-900">
                Interview Questions
              </h3>
            </div>
            <svg
              className={cn(
                'w-5 h-5 text-gray-500 transition-transform duration-200',
                questionsExpanded && 'transform rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {questionsExpanded && (
            <div className="px-6 py-4 border-t border-gray-200 animate-slide-in-top">
              <InterviewQuestions questions={questions} listeningGuidance={listeningGuidance} />
            </div>
          )}
        </section>
      )}

      {/* TERTIARY: Notes (Optional, De-emphasized) */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </h3>
        <TextArea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add context, observations, or follow-up items..."
          rows={3}
        />
      </section>

    </div>
  );
}
