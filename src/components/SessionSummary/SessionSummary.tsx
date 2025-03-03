import React, { useMemo } from 'react';
import { SessionSummary as SessionSummaryType } from '../../services/api';
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
 */
const SessionSummary: React.FC<Props> = ({ summary, className = '' }) => {
  // Calculate summary statistics
  const stats = useMemo(() => calculateSessionStats(summary), [summary]);

  return (
    <div className={`w-full ${className}`}>
      {/* Two-column layout with stats in left column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Stats + Problems */}
        <div className="space-y-4">
          {/* Session Statistics */}
          <StatsSummary stats={stats} />
          
          {/* Problems Attempted with compact header */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Problems Attempted</h3>
            <ProblemList attempts={summary.attempts} />
          </div>
        </div>

        {/* Right Column: Problem Mastery only */}
        <div>
  
          <MasteryGrid problemWeights={summary.problemWeights} />
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;