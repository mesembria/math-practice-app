import React from 'react';
import { ProblemType } from '../../services/api';

interface ProblemDisplayProps {
  factor1: number | null;
  factor2: number | null;
  answer: string;
  className?: string;
  problemType?: ProblemType;
  missingOperandPosition?: 'first' | 'second';
  product?: number;
}

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ 
  factor1, 
  factor2,
  answer,
  className = '',
  problemType = ProblemType.MULTIPLICATION,
  missingOperandPosition,
  product
}) => {
  // Calculate the product if not provided (for backward compatibility)
  // But only if both factors are not null
  const actualProduct = problemType === ProblemType.MISSING_FACTOR
  ? product
  : (factor1 !== null && factor2 !== null) ? factor1 * factor2 : null;

  return (
    <div 
      className={`
        flex items-center justify-center
        min-h-[150px] w-full
        bg-white rounded-lg shadow-sm
        ${className}
      `}
      role="region"
      aria-label={problemType === ProblemType.MULTIPLICATION ? 
        "multiplication problem" : "missing factor problem"}
    >
      <p 
        className={`
          font-semibold text-gray-800 tracking-wide font-['Arial']
          ${className.includes('text-') ? '' : 'text-5xl md:text-6xl'}
        `}
      >
        {problemType === ProblemType.MULTIPLICATION ? (
          // Standard multiplication display
          <>
            <span className="inline-block min-w-[1.5ch] text-center">{factor1}</span>
            <span className="mx-4 text-gray-600"> × </span>
            <span className="inline-block min-w-[1.5ch] text-center">{factor2}</span>
            <span className="mx-4">=</span>
            <span className="inline-block min-w-[3ch] text-center text-blue-600">
              {answer !== '0' ? answer : ''}
            </span>
          </>
        ) : problemType === ProblemType.MISSING_FACTOR && missingOperandPosition === 'first' ? (
          // Missing first operand display
          <>
            <span className="inline-block min-w-[1.5ch] text-center text-blue-600">
              {answer !== '0' ? answer : '?'}
            </span>
            <span className="mx-4 text-gray-600"> × </span>
            <span className="inline-block min-w-[1.5ch] text-center">{factor2}</span>
            <span className="mx-4">=</span>
            <span className="inline-block min-w-[3ch] text-center">{actualProduct}</span>
          </>
        ) : (
          // Missing second operand display
          <>
            <span className="inline-block min-w-[1.5ch] text-center">{factor1}</span>
            <span className="mx-4 text-gray-600"> × </span>
            <span className="inline-block min-w-[1.5ch] text-center text-blue-600">
              {answer !== '0' ? answer : '?'}
            </span>
            <span className="mx-4">=</span>
            <span className="inline-block min-w-[3ch] text-center">{actualProduct}</span>
          </>
        )}
      </p>
    </div>
  );
};

export default ProblemDisplay;