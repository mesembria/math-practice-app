// src/components/SessionSummary/SessionSummary.tsx
import React, { useMemo } from 'react';
import { SessionSummary as SessionSummaryType, ProblemType } from '../../services/api';
import StatsSummary from './StatsSummary';
import ProblemList from './ProblemList';
import MasteryGrid from './MasteryGrid';
import { calculateSessionStats } from './utils/calculations';

interface Props {
  summary: SessionSummaryType;
  className?: string;
}

/**
 * SessionSummary component with optimized layout:
 * - Left column: Stats + Problems
 * - Right column: Mastery Grid
 * - Reduced headers and margins
 * Adapts display based on problem type
 */
const SessionSummary: React.FC<Props> = ({ summary, className = '' }) => {
  // Get the problem type from the session stats or determine from the first attempt
  const problemType = useMemo(() => {
    // First check if session stats have a problem type
    if (summary.sessionStats.problemType) {
      return summary.sessionStats.problemType;
    }
    
    // If not, try to determine from the first attempt
    if (summary.attempts.length > 0 && summary.attempts[0].problemType) {
      return summary.attempts[0].problemType;
    }
    
    // Default to multiplication
    return ProblemType.MULTIPLICATION;
  }, [summary]);
  
  // Calculate summary statistics - now passing the problem type
  const stats = useMemo(() => calculateSessionStats(summary, problemType), [summary, problemType]);
  
  // Get problem type label for display
  const getProblemTypeLabel = (type: ProblemType): string => {
    switch (type) {
      case ProblemType.MULTIPLICATION:
        return 'Multiplication';
      case ProblemType.MISSING_FACTOR:
        return 'Missing Factor';
      case ProblemType.DIVISION:
        return 'Division';
      default:
        return 'Practice';
    }
  };
  
  const problemTypeLabel = getProblemTypeLabel(problemType);
  
  // Filter attempts to only show the current problem type
  const filteredAttempts = useMemo(() => {
    return summary.attempts.filter(attempt => attempt.problemType === problemType);
  }, [summary.attempts, problemType]);

  // Enhance problem weights with problemType if not included
  const enhancedWeights = useMemo(() => {
    // First confirm that problemWeights is an array
    if (!Array.isArray(summary.problemWeights)) {
      console.error('summary.problemWeights is not an array:', summary.problemWeights);
      return [];
    }
    
    return summary.problemWeights.map(weight => {
      // For safety, check if weight is a valid object
      if (!weight || typeof weight !== 'object') {
        console.error('Invalid weight object:', weight);
        return { factor1: 0, factor2: 0, weight: 10, problemType };
      }
      
      // If the weight already has a problemType property, use it
      // Otherwise, add the current problem type
      return {
        factor1: weight.factor1,
        factor2: weight.factor2,
        weight: weight.weight,
        problemType: weight.problemType || problemType 
      };
    });
  }, [summary.problemWeights, problemType]);

  return (
    <div className={`w-full ${className}`}>
      {/* Two-column layout with stats in left column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Stats + Problems */}
        <div className="space-y-4">
          {/* Session Statistics */}
          <StatsSummary 
            stats={stats} 
            problemType={problemType}
            problemTypeLabel={problemTypeLabel}
          />
          
          {/* Problems Attempted with compact header */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{problemTypeLabel} Problems Attempted</h3>
            <ProblemList attempts={filteredAttempts} />
            
            {filteredAttempts.length === 0 && summary.attempts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-800">
                No {problemTypeLabel.toLowerCase()} problems were attempted in this session.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Problem Mastery */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{problemTypeLabel} Problem Mastery</h3>
          <MasteryGrid 
            problemWeights={enhancedWeights} 
            problemType={problemType}
          />
          
          {enhancedWeights.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-center text-yellow-800">
              No mastery data available for {problemTypeLabel.toLowerCase()} problems.
            </div>
          )}
        </div>
      </div>
      
      {/* Add a tab navigation for switching between problem types if session has multiple types */}
      {hasMixedProblemTypes(summary) && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Problem Types in this Session</h4>
          <div className="flex flex-wrap gap-2">
            {getUniqueSessionProblemTypes(summary).map(type => (
              <div 
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${type === problemType 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                  }`}
              >
                {getProblemTypeLabel(type)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to check if the session contains multiple problem types
 */
function hasMixedProblemTypes(summary: SessionSummaryType): boolean {
  const problemTypes = new Set<ProblemType>();
  
  // Check attempts
  summary.attempts.forEach(attempt => {
    if (attempt.problemType) {
      problemTypes.add(attempt.problemType);
    }
  });
  
  return problemTypes.size > 1;
}

/**
 * Helper function to get unique problem types in the session
 */
function getUniqueSessionProblemTypes(summary: SessionSummaryType): ProblemType[] {
  const problemTypes = new Set<ProblemType>();
  
  // Add primary session type if available
  if (summary.sessionStats.problemType) {
    problemTypes.add(summary.sessionStats.problemType);
  }
  
  // Check attempts
  summary.attempts.forEach(attempt => {
    if (attempt.problemType) {
      problemTypes.add(attempt.problemType);
    }
  });
  
  return Array.from(problemTypes);
}

export default SessionSummary;