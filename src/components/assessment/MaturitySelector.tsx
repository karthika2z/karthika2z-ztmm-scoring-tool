import { cn } from '../../utils/cn';
import type { MaturityLevel, Dimension } from '../../types';

interface MaturitySelectorProps {
  dimension: Dimension;
  selectedLevel: MaturityLevel | null;
  onSelect: (level: MaturityLevel) => void;
}

export function MaturitySelector({ dimension, selectedLevel, onSelect }: MaturitySelectorProps) {
  const levels: MaturityLevel[] = ['traditional', 'initial', 'advanced', 'optimal'];

  const getLevelColor = (level: MaturityLevel) => {
    const colors = {
      traditional: 'maturity-card-traditional',
      initial: 'maturity-card-initial',
      advanced: 'maturity-card-advanced',
      optimal: 'maturity-card-optimal',
    };
    return colors[level];
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
          Maturity Assessment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the maturity level that best matches the customer based on their responses:
        </p>
      </div>

      <div className="space-y-3">
        {levels.map((level) => {
          const levelData = dimension.maturityLevels[level];
          const isSelected = selectedLevel === level;

          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={cn(
                'maturity-card w-full text-left transition-all duration-200',
                getLevelColor(level),
                isSelected ? 'maturity-card-selected' : 'hover:shadow-md hover:scale-[1.01]'
              )}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected ? 'border-current' : 'border-gray-300'
                  )}>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-current animate-scale-in"></div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                      {levelData.name}
                    </h4>
                    {isSelected && (
                      <span className="text-sm text-green-600 font-medium animate-fade-in">✓ Selected</span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">
                    {levelData.description}
                  </p>

                  <ul className="space-y-1">
                    {levelData.indicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
