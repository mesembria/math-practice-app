// src/components/SessionReview/PerformanceSummary.tsx
import React from 'react';
import PerformanceChart from './PerformanceChart';
import ChallengeProblems from './ChallengeProblems';

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
    };
    challengingProblems: Array<{
      factor1: number;
      factor2: number;
      accuracy: number;
      averageResponseTime: number;
      attempts: number;
    }>;
    slowestProblems: Array<{
      factor1: number;
      factor2: number;
      accuracy: number;
      averageResponseTime: number;
      attempts: number;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  selectedUserId: number | null;
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
  selectedUserId
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
          <p className="text-gray-500">No {title.toLowerCase()} data available</p>
        </div>
      );
    }

    return content;
  };

  // Format time in ms to seconds with one decimal
  const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="bg-[#f8f9fa] p-4 rounded-lg shadow-sm w-full overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
      
      {/* Overall Stats Display */}
      {data && !isLoading && selectedUserId && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <div className="text-sm text-blue-700 font-medium">Accuracy</div>
            <div className="text-lg font-bold text-blue-800">{data.overallAccuracy.toFixed(1)}%</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="text-sm text-green-700 font-medium">Problems</div>
            <div className="text-lg font-bold text-green-800">{data.totalProblems}</div>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg text-center">
            <div className="text-sm text-purple-700 font-medium">Sessions</div>
            <div className="text-lg font-bold text-purple-800">{data.totalSessions}</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg text-center">
            <div className="text-sm text-amber-700 font-medium">Avg Response</div>
            <div className="text-lg font-bold text-amber-800">{formatTime(data.averageResponseTime)}</div>
          </div>
        </div>
      )}
      
      {/* Performance Trend Chart - shrinks vertically as needed */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Performance Trend</h3>
        {renderContent(
          'Performance Trend Chart',
            <div className="h-32 sm:h-40 md:h-48">
              <PerformanceChart 
                dates={data?.trends?.sessions || []}
                accuracy={data?.trends?.accuracy || []}
                responseTime={data?.trends?.responseTime || []}
              />
            </div>,
          'h-32 sm:h-40 md:h-48'
        )}
      </div>
      
      {/* Problem Performance Section - Two columns on smaller screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Challenging Problems */}
        <div>
          <h3 className="text-lg font-medium mb-2">Most Challenging Problems</h3>
          {renderContent(
            'Challenging Problems',
            <ChallengeProblems 
              problems={data?.challengingProblems || []}
              type="challenging"
            />,
            'min-h-[120px] max-h-[180px]'
          )}
        </div>
        
        {/* Slowest Problems */}
        <div>
          <h3 className="text-lg font-medium mb-2">Slowest Problems</h3>
          {renderContent(
            'Slowest Problems',
            <ChallengeProblems 
              problems={data?.slowestProblems || []}
              type="slowest"
            />,
            'min-h-[120px] max-h-[180px]'
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;