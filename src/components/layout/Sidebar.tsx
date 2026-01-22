import { useAssessment } from '../../contexts/AssessmentContext';
import { calculateProgress } from '../../utils/assessment';
import frameworkData from '../../data/framework.json';
import type { PillarId, CloudProvider } from '../../types';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const { state, dispatch } = useAssessment();
  const progress = calculateProgress(state.assessment, frameworkData);
  const { navigation } = state.ui;

  const handleNavigate = (pillarId: PillarId | 'setup' | 'summary', dimensionId?: string, cloudProvider?: CloudProvider) => {
    dispatch({
      type: 'NAVIGATE',
      payload: {
        currentPillar: pillarId,
        currentDimension: dimensionId,
        currentCloud: cloudProvider,
      },
    });

    // Close mobile drawer after navigation
    onNavigate?.();
  };

  const getStatusIcon = (completed: number, total: number) => {
    if (completed === 0) return <span className="status-pending">○</span>;
    if (completed === total) return <span className="status-complete">✓</span>;
    return <span className="status-in-progress">●</span>;
  };

  const pillars = [
    { id: 'networks' as PillarId, name: 'Networks', icon: '🌐' },
    { id: 'applicationsWorkloads' as PillarId, name: 'Apps & Workloads', icon: '🚀' },
    { id: 'data' as PillarId, name: 'Data', icon: '🔒' },
    { id: 'crossCutting' as PillarId, name: 'Cross-Cutting', icon: '🔗' },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {/* Setup */}
        <button
          onClick={() => handleNavigate('setup')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            navigation.currentPillar === 'setup'
              ? 'bg-aviatrix-orange text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">📋</span>
            <span className="font-medium">Setup</span>
            {state.assessment.metadata.customerName && <span className="ml-auto text-green-500">✓</span>}
          </div>
        </button>

        {/* Pillars */}
        {pillars.map((pillar) => {
          const pillarProgress = progress.pillars.find(p => p.pillarId === pillar.id);
          const pillarData = frameworkData.pillars[pillar.id];

          return (
            <div key={pillar.id} className="space-y-1">
              <button
                onClick={() => {
                  // Networks pillar requires cloud providers to be selected
                  if (pillar.id === 'networks' && state.assessment.metadata.cloudProviders.length === 0) {
                    alert('Please complete Setup and select at least one cloud provider before assessing Networks.');
                    handleNavigate('setup');
                    return;
                  }

                  const firstDimensionId = Object.keys(pillarData.dimensions)[0];
                  if (pillar.id === 'networks' && state.assessment.metadata.cloudProviders.length > 0) {
                    handleNavigate(pillar.id, firstDimensionId, state.assessment.metadata.cloudProviders[0]);
                  } else {
                    handleNavigate(pillar.id, firstDimensionId);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  navigation.currentPillar === pillar.id
                    ? 'bg-aviatrix-orange text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{pillar.icon}</span>
                  <span className="font-medium flex-1">{pillar.name}</span>
                  {pillarProgress && (
                    <span className="text-sm">
                      {getStatusIcon(pillarProgress.completedDimensions, pillarProgress.totalDimensions)}
                    </span>
                  )}
                </div>
              </button>

              {/* Show dimensions when pillar is active and it's networks with multiple clouds */}
              {navigation.currentPillar === pillar.id && pillar.id === 'networks' &&
               state.assessment.metadata.cloudProviders.length > 0 && (
                <div className="ml-4 space-y-1">
                  {state.assessment.metadata.cloudProviders.map(cloud => (
                    <div key={cloud} className="text-sm">
                      <div className="px-4 py-2 text-gray-600 font-medium">
                        → {cloud}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <button
          onClick={() => handleNavigate('summary')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            navigation.currentPillar === 'summary'
              ? 'bg-aviatrix-orange text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">📊</span>
            <span className="font-medium">Summary</span>
          </div>
        </button>
      </div>
    </div>
  );
}
