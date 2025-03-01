import React from 'react';

interface ProgressStatsProps {
  results: Array<boolean | null>;
  totalProblems: number;
}

/**
 * Displays statistics about the user's progress in the exercise
 */
const ProgressStats: React.FC<ProgressStatsProps> = ({ results, totalProblems }) => (
  <div className="mt-6 text-sm text-gray-600">
    Problem {results.filter(r => r !== null).length + 1} of {totalProblems}
    {results.filter(r => r === true).length > 0 && 
      ` • ${results.filter(r => r === true).length} correct`}
    {results.filter(r => r === false).length > 0 && 
      ` • ${results.filter(r => r === false).length} incorrect`}
  </div>
);

export default ProgressStats;