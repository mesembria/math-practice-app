import React, { useMemo } from 'react';
import { SessionSummary as SessionSummaryType } from '../../services/api';
import StatsSummary from './StatsSummary';
import ProblemList from './ProblemList';
import MasteryGrid from './MasteryGrid';
import PerformanceInsights from './PerformanceInsights';
import { calculateSessionStats } from './utils/calculations';

interface Props {
  summary: SessionSummaryType;
  className?: string;
}

/**
 * SessionSummary component shows a comprehensive summary of an exercise session
 * including statistics, problem list, mastery grid, and performance insights.
 */
const SessionSummary: React.FC<Props> = ({ summary, className = '' }) => {
  // Calculate summary statistics
  const stats = useMemo(() => calculateSessionStats(summary), [summary]);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto p-4 ${className}`}>
      {/* Left Column: Stats and Problem List */}
      <div className="space-y-6">
        <StatsSummary stats={stats} />
        <ProblemList attempts={summary.attempts} />
      </div>

      {/* Right Column: Multiplication Grid and Insights */}
      <div className="space-y-6">
        <MasteryGrid problemWeights={summary.problemWeights} />
        <PerformanceInsights stats={stats} />
      </div>
    </div>
  );
};

export default SessionSummary;