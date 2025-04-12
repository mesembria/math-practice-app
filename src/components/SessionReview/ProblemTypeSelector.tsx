// src/components/SessionReview/ProblemTypeSelector.tsx
import React from 'react';
import { ProblemType } from '../../services/api';

interface ProblemTypeSelectorProps {
  selectedType: ProblemType;
  onTypeChange: (type: ProblemType) => void;
  className?: string;
}

const ProblemTypeSelector: React.FC<ProblemTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  className = ''
}) => {
  const problemTypes = [
    { type: ProblemType.MULTIPLICATION, label: 'Multiplication' },
    { type: ProblemType.MISSING_FACTOR, label: 'Missing Factor' }
  ];

  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      {problemTypes.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onTypeChange(type)}
          className={`
            px-4 py-2 text-sm font-medium
            ${selectedType === type 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'}
            ${type === ProblemType.MULTIPLICATION ? 'rounded-l-md' : 'rounded-r-md'}
            border ${type === ProblemType.MULTIPLICATION ? 'border-r-0' : ''}
            focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ProblemTypeSelector;