import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AssessmentAction, AssessmentData } from '../types';
import { createEmptyAssessment, updatePillarMaturity } from '../utils/assessment';

// Initial state
const initialState: AppState = {
  assessment: createEmptyAssessment(),
  ui: {
    navigation: {
      currentPillar: 'setup',
    },
    isDirty: false,
    sidebarCollapsed: false,
  },
};

// Reducer function
function assessmentReducer(state: AppState, action: AssessmentAction): AppState {
  switch (action.type) {
    case 'LOAD_ASSESSMENT':
      return {
        ...state,
        assessment: action.payload,
        ui: {
          ...state.ui,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        },
      };

    case 'UPDATE_METADATA': {
      const newState = {
        ...state,
        assessment: {
          ...state.assessment,
          metadata: {
            ...state.assessment.metadata,
            ...action.payload,
          },
          lastModified: new Date().toISOString(),
        },
        ui: {
          ...state.ui,
          isDirty: true,
        },
      };

      // If cloud providers changed, update network pillar structure
      if (action.payload.cloudProviders) {
        const newCloudProviders = action.payload.cloudProviders;
        const existingNetworks = newState.assessment.pillars.networks.cloudSpecific;
        const newNetworks = {} as typeof existingNetworks;

        // Initialize structure for each cloud provider
        newCloudProviders.forEach(provider => {
          if (existingNetworks[provider]) {
            // Keep existing data if provider was already configured
            newNetworks[provider] = existingNetworks[provider];
          } else {
            // Initialize new provider
            newNetworks[provider] = {
              dimensions: {},
              pillarMaturity: {
                calculated: null,
                final: null,
                overridden: false,
              },
            };
          }
        });

        newState.assessment.pillars.networks.cloudSpecific = newNetworks;
      }

      return newState;
    }

    case 'UPDATE_DIMENSION': {
      const { pillarId, dimensionId, cloudProvider, data } = action.payload;
      const newState = { ...state };

      if (pillarId === 'networks' && cloudProvider) {
        // Update network pillar dimension
        const cloudData = newState.assessment.pillars.networks.cloudSpecific[cloudProvider];
        if (cloudData) {
          cloudData.dimensions[dimensionId] = {
            ...cloudData.dimensions[dimensionId],
            ...data,
            timestamp: new Date().toISOString(),
          };

          // Recalculate pillar maturity
          const dimensionScores: Record<string, any> = {};
          Object.entries(cloudData.dimensions).forEach(([dimId, dim]) => {
            dimensionScores[dimId] = dim.maturityLevel;
          });

          cloudData.pillarMaturity = updatePillarMaturity(
            { dimensions: cloudData.dimensions, pillarMaturity: cloudData.pillarMaturity }
          );
        }
      } else if (pillarId !== 'networks') {
        // Update standard pillar dimension
        newState.assessment.pillars[pillarId].dimensions[dimensionId] = {
          ...newState.assessment.pillars[pillarId].dimensions[dimensionId],
          ...data,
          timestamp: new Date().toISOString(),
        };

        // Recalculate pillar maturity
        newState.assessment.pillars[pillarId].pillarMaturity = updatePillarMaturity(
          newState.assessment.pillars[pillarId]
        );
      }

      newState.assessment.lastModified = new Date().toISOString();
      newState.ui.isDirty = true;

      return newState;
    }

    case 'UPDATE_PILLAR_MATURITY': {
      const { pillarId, cloudProvider, maturity } = action.payload;
      const newState = { ...state };

      if (pillarId === 'networks' && cloudProvider) {
        const cloudData = newState.assessment.pillars.networks.cloudSpecific[cloudProvider];
        if (cloudData) {
          cloudData.pillarMaturity = maturity;
        }
      } else if (pillarId !== 'networks') {
        newState.assessment.pillars[pillarId].pillarMaturity = maturity;
      }

      newState.assessment.lastModified = new Date().toISOString();
      newState.ui.isDirty = true;

      return newState;
    }

    case 'UPDATE_OVERALL_ASSESSMENT':
      return {
        ...state,
        assessment: {
          ...state.assessment,
          overallAssessment: {
            ...state.assessment.overallAssessment,
            ...action.payload,
          },
          lastModified: new Date().toISOString(),
        },
        ui: {
          ...state.ui,
          isDirty: true,
        },
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        ui: {
          ...state.ui,
          isDirty: true,
        },
      };

    case 'MARK_CLEAN':
      return {
        ...state,
        ui: {
          ...state.ui,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        },
      };

    case 'NAVIGATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          navigation: action.payload,
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };

    case 'RESET_ASSESSMENT':
      return {
        ...initialState,
        assessment: createEmptyAssessment(),
      };

    case 'INCREMENT_VERSION': {
      const currentVersion = state.assessment.fileVersion;
      const match = currentVersion.match(/v(\d+)/);
      const newVersion = match ? `v${parseInt(match[1]) + 1}` : 'v1';

      return {
        ...state,
        assessment: {
          ...state.assessment,
          fileVersion: newVersion,
          lastModified: new Date().toISOString(),
          changeHistory: [
            ...state.assessment.changeHistory,
            {
              timestamp: new Date().toISOString(),
              fileVersion: newVersion,
              action: 'updated',
            },
          ],
        },
      };
    }

    default:
      return state;
  }
}

// Context
interface AssessmentContextType {
  state: AppState;
  dispatch: React.Dispatch<AssessmentAction>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Provider component
export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Save to localStorage on state change (persists across browser sessions)
  useEffect(() => {
    if (state.assessment.assessmentId) {
      try {
        localStorage.setItem('ztmm-assessment', JSON.stringify(state.assessment));
        localStorage.setItem('ztmm-assessment-timestamp', new Date().toISOString());
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [state.assessment]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ztmm-assessment');
      if (saved) {
        const assessment = JSON.parse(saved) as AssessmentData;
        dispatch({ type: 'LOAD_ASSESSMENT', payload: assessment });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, []);

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

// Custom hook to use the assessment context
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
