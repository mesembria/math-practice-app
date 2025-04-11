import React from 'react';
import PerformanceChart from './PerformanceChart';
import ChallengeProblems from './ChallengeProblems';
import { ProblemType } from '../../services/api';

interface ProblemInterface {
  factor1: number;
  factor2: number;
  accuracy: number;
  averageResponseTime: number;
  attempts: number;
  problemType?: ProblemType;
}

interface PerformanceSummaryProps {
  data: {
    totalSessions: number;
    totalProblems: number;
    overallAccuracy: number;
    averageResponseTime: number;
    trends: {
      sessions: string[];
      accuracy: number[];
      responseTime: number[];
      problemTypes?: {
        [key in ProblemType]?: {
          accuracy: number[];
          responseTime: number[];
        };
      };
    };
    challengingProblems: ProblemInterface[];
    slowestProblems: ProblemInterface[];
    problemTypeStats?: {
      [key in ProblemType]?: {
        totalProblems: number;
        correctProblems: number;
        accuracy: number;
        averageResponseTime: number;
      };
    };
  } | null;
  isLoading: boolean;
  error: string | null;
  selectedUserId: number | null;
  problemType: ProblemType;
}

/**
 * PerformanceSummary container component for the Review page
 * Displays overall performance metrics including:
 * - Performance trend chart
 * - Most challenging problems
 * - Slowest problems
 */
const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  data,
  isLoading,
  error,
  selectedUserId,
  problemType
}) => {
  // Helper function to render content based on loading/error/data state
  const renderContent = (title: string, content: React.ReactNode, height: string = 'h-64') => {
    if (isLoading) {
      return (
        <div className={`${height} flex flex-col items-center justify-center gap-2`}>
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading {title.toLowerCase()} data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`${height} flex items-center justify-center`}>
          <p className="text-red-500">Error: {error}</p>
        </div>
      );
    }

    if (!selectedUserId) {
      return (
        <div className={`${height} flex items-center justify-center`}>
          <p className="text-gray-500">Please select a user to view {title.toLowerCase()}</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className={`${height} flex items-center justify-center`}>
          <p className="text-gray-500">No {title.toLowerCase()} data available for {problemType === ProblemType.MULTIPLICATION ? 'multiplication' : 'missing factor'} problems</p>
        </div>
      );
    }

    return content;
  };

  // Format time in ms to seconds with one decimal
  const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(1) + 's';
  };

  // Get problem type label
  const problemTypeLabel = problemType === ProblemType.MULTIPLICATION 
    ? 'Multiplication' 
    : 'Missing Factor';

  // Get problem type specific stats if available
  const getTypeSpecificStats = () => {
    return {
      totalProblems: data?.totalProblems || 0,
      correctProblems: Math.round(((data?.overallAccuracy || 0) / 100) * (data?.totalProblems || 0)),
      accuracy: data?.overallAccuracy || 0,
      averageResponseTime: data?.averageResponseTime || 0,
      sessionCount: data?.trends?.sessions?.length || 0
    };
  };

  const typeStats = getTypeSpecificStats();

  // Create empty arrays as fallbacks for the challenge problems
  const emptyProblemsArray: ProblemInterface[] = [];
  
  // Use data?.challengingProblems or empty array if undefined
  const challengingProblems = data?.challengingProblems || emptyProblemsArray;
  const slowestProblems = data?.slowestProblems || emptyProblemsArray;

  return (
    <div className="bg-[#f8f9fa] p-4 rounded-lg shadow-sm w-full overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">
        {problemTypeLabel} Performance
      </h2>
      
      {/* Overall Stats Display */}
      {data && !isLoading && selectedUserId && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <div className="text-sm text-blue-700 font-medium">Accuracy</div>
            <div className="text-lg font-bold text-blue-800">{typeStats.accuracy.toFixed(1)}%</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="text-sm text-green-700 font-medium">Problems</div>
            <div className="text-lg font-bold text-green-800">{typeStats.totalProblems}</div>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg text-center">
            <div className="text-sm text-purple-700 font-medium">Sessions</div>
            <div className="text-lg font-bold text-purple-800">{typeStats.sessionCount}</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg text-center">
            <div className="text-sm text-amber-700 font-medium">Avg Response</div>
            <div className="text-lg font-bold text-amber-800">{formatTime(typeStats.averageResponseTime)}</div>
          </div>
        </div>
      )}
      
      {/* Performance Trend Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{problemTypeLabel} Trend</h3>
        {renderContent(
          `${problemTypeLabel} Trend Chart`,
          <div className="h-48 md:h-64">
            <PerformanceChart 
              dates={data?.trends?.sessions || []}
              accuracy={data?.trends?.problemTypes?.[problemType]?.accuracy || data?.trends?.accuracy || []}
              responseTime={data?.trends?.problemTypes?.[problemType]?.responseTime || data?.trends?.responseTime || []}
            />
          </div>,
          'h-48 md:h-64'
        )}
      </div>
      
      {/* Problem Performance Section - Two columns side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Most Challenging Problems */}
        <div>
          <h3 className="text-lg font-medium mb-2">Most Challenging</h3>
          {renderContent(
            `Challenging ${problemTypeLabel} Problems`,
            <ChallengeProblems 
              problems={challengingProblems}
              type="challenging"
            />,
            'min-h-[180px] max-h-[200px]'
          )}
        </div>
        
        {/* Slowest Problems */}
        <div>
          <h3 className="text-lg font-medium mb-2">Slowest</h3>
          {renderContent(
            `Slowest ${problemTypeLabel} Problems`,
            <ChallengeProblems 
              problems={slowestProblems}
              type="slowest"
            />,
            'min-h-[180px] max-h-[200px]'
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;