import React from 'react';
import clsx from 'clsx';

interface ProgressIndicatorProps {
  totalProblems: number;
  currentProblemIndex: number;
  results: Array<boolean | null>;
  isRetry?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalProblems,
  currentProblemIndex,
  results,
  isRetry = false,
  className = '',
}) => {
  // Validate and normalize inputs
  const normalizedIndex = Math.max(0, Math.min(currentProblemIndex, totalProblems - 1));
  const normalizedResults = results.slice(0, totalProblems);
  while (normalizedResults.length < totalProblems) {
    normalizedResults.push(null);
  }

  return (
    <div
      className={clsx(
        'flex justify-center w-full gap-0',
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={totalProblems}
      aria-valuenow={currentProblemIndex + 1}
      aria-label={`Problem ${currentProblemIndex + 1} of ${totalProblems}`}
    >
      <div className="flex w-full max-w-3xl">
        {normalizedResults.map((result, index) => {
          const isCurrent = index === normalizedIndex;
          const baseColors = {
            null: 'bg-gray-200',
            true: 'bg-green-500',
            false: 'bg-red-500',
          };
          const retryColors = {
            null: 'bg-gray-100',
            true: 'bg-green-300',
            false: 'bg-red-300',
          };
          
          const colors = isRetry ? retryColors : baseColors;
          
          return (
            <div
              key={index}
              className={clsx(
                'aspect-square w-full min-w-[24px] transition-colors',
                colors[`${result}`],
                isCurrent && 'ring-2 ring-blue-500 ring-inset',
                // Add subtle patterns for colorblind accessibility
                result === true && 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm2 2v16h16V2H2z\' fill=\'rgba(255,255,255,0.1)\'/%3E%3C/svg%3E")]',
                result === false && 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0l20 20M20 0L0 20\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\'/%3E%3C/svg%3E")]'
              )}
              role="status"
              aria-label={
                isCurrent
                  ? `Current problem ${index + 1}`
                  : `Problem ${index + 1}: ${
                      result === null
                        ? 'not attempted'
                        : result
                        ? 'correct'
                        : 'incorrect'
                    }`
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
