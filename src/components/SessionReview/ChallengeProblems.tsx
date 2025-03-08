// src/components/SessionReview/ChallengeProblems.tsx
import React from 'react';

interface Problem {
  factor1: number;
  factor2: number;
  accuracy: number;
  averageResponseTime: number;
  attempts: number;
}

interface ChallengeProblemProps {
  problems: Problem[];
  type: 'challenging' | 'slowest';
}

/**
 * Displays a list of challenging or slowest problems with performance metrics
 * Optimized for responsive layouts
 */
const ChallengeProblems: React.FC<ChallengeProblemProps> = ({ problems, type }) => {
  // Format time in ms to seconds with one decimal
  const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(1) + 's';
  };

  // If no data, show a message
  if (problems.length === 0) {
    return (
      <div className="bg-white rounded-lg p-2 text-center h-24 flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-1 overflow-hidden h-full">
      <div className="overflow-y-auto max-h-[180px]">
        {problems.map((problem, index) => (
          <div 
            key={index} 
            className={`p-1.5 mb-1 rounded-lg flex items-center justify-between
                       ${type === 'challenging' ? 'bg-blue-50' : 'bg-red-50'}`}
          >
            <div className="flex items-center">
              {/* Problem Index */}
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-medium
                          ${type === 'challenging' ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}
              >
                {index + 1}
              </div>
              
              {/* Problem Expression */}
              <div className="font-medium text-sm">
                {problem.factor1} × {problem.factor2} = {problem.factor1 * problem.factor2}
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="text-right">
              {type === 'challenging' ? (
                <div className="text-xs font-medium text-blue-800">
                  {problem.accuracy.toFixed(1)}% accuracy
                </div>
              ) : (
                <div className="text-xs font-medium text-red-800">
                  {formatTime(problem.averageResponseTime)} avg
                </div>
              )}
              <div className="text-xs text-gray-500">
                {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeProblems;