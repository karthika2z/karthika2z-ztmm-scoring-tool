import { useAssessment } from '../../contexts/AssessmentContext';
import { calculateProgress } from '../../utils/assessment';
import frameworkData from '../../data/framework.json';
import { Button } from '../common/Button';
import aviatrixLogo from '../../assets/aviatrix.png';

interface TopNavigationProps {
  onLoad: () => void;
  onSave: () => void;
  onToggleMobileMenu: () => void;
}

export function TopNavigation({ onLoad, onSave, onToggleMobileMenu }: TopNavigationProps) {
  const { state } = useAssessment();
  const progress = calculateProgress(state.assessment, frameworkData);

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* LEFT: Hamburger + Logo + Title */}
        <div className="flex items-center space-x-3 md:space-x-6 flex-1 min-w-0">
          {/* Hamburger Menu (mobile only) */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo + Title (responsive) */}
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={aviatrixLogo}
              alt="Aviatrix Logo"
              className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-heading font-bold text-gray-900 truncate">
                {state.assessment.metadata.customerName || 'New Assessment'}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                Zero Trust Maturity Assessment
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Progress + Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {/* Progress (hide on mobile) */}
          <div className="hidden md:block text-sm text-gray-600">
            Progress: <span className="font-semibold">{progress.overallPercentage}%</span>
            <span className="ml-2 text-gray-400">
              ({progress.pillars.reduce((sum, p) => sum + p.completedDimensions, 0)}/
              {progress.pillars.reduce((sum, p) => sum + p.totalDimensions, 0)})
            </span>
          </div>

          {/* Buttons (icons only on mobile) */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button variant="ghost" onClick={onLoad} className="px-2 md:px-4">
              <span className="md:hidden">📁</span>
              <span className="hidden md:inline">📁 Load</span>
            </Button>
            <Button variant="ghost" onClick={onSave} className="px-2 md:px-4">
              <span className="md:hidden">💾</span>
              <span className="hidden md:inline">💾 Save</span>
            </Button>
          </div>

          {/* Status Indicators (simplified on mobile) */}
          {state.ui.isDirty && (
            <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 bg-yellow-50 rounded text-xs md:text-sm text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="hidden sm:inline">Unsaved</span>
            </div>
          )}

          {!state.ui.isDirty && state.ui.lastSaved && (
            <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 bg-green-50 rounded text-xs md:text-sm text-green-700">
              <span>✓</span>
              <span className="hidden sm:inline">Saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
