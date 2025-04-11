import React, { ReactElement } from 'react';
import { SessionStats } from './utils/calculations';
import { formatTime } from './utils/formatters';
import { ProblemType } from '../../services/api';

interface StatsSummaryProps {
  stats: SessionStats;
  problemType: ProblemType;
  problemTypeLabel: string;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  stats, 
  problemType,
  problemTypeLabel
}) => {
  // Get appropriate label for the "Needs Practice" section based on problem type
  const getPracticeLabel = (): string => {
    switch (problemType) {
      case ProblemType.MULTIPLICATION:
        return 'Needs Practice';
      case ProblemType.MISSING_FACTOR:
        return 'Focus On';
      case ProblemType.DIVISION:
        return 'Challenging Problems';
      default:
        return 'Needs Practice';
    }
  };
  
  // Get background color for cards based on problem type
  const getCardStyles = (): {
    accuracyBg: string;
    responseBg: string;
    fastestBg: string;
    practiceBg: string;
    accuracyText: string;
    responseText: string;
    fastestText: string;
    practiceText: string;
  } => {
    switch (problemType) {
      case ProblemType.MULTIPLICATION:
        return {
          accuracyBg: 'bg-blue-50',
          responseBg: 'bg-purple-50',
          fastestBg: 'bg-green-50',
          practiceBg: 'bg-amber-50',
          accuracyText: 'text-blue-800',
          responseText: 'text-purple-800',
          fastestText: 'text-green-800',
          practiceText: 'text-amber-800'
        };
      case ProblemType.MISSING_FACTOR:
        return {
          accuracyBg: 'bg-indigo-50',
          responseBg: 'bg-violet-50',
          fastestBg: 'bg-teal-50',
          practiceBg: 'bg-orange-50',
          accuracyText: 'text-indigo-800',
          responseText: 'text-violet-800',
          fastestText: 'text-teal-800',
          practiceText: 'text-orange-800'
        };
      case ProblemType.DIVISION:
        return {
          accuracyBg: 'bg-sky-50',
          responseBg: 'bg-fuchsia-50',
          fastestBg: 'bg-emerald-50',
          practiceBg: 'bg-yellow-50',
          accuracyText: 'text-sky-800',
          responseText: 'text-fuchsia-800',
          fastestText: 'text-emerald-800',
          practiceText: 'text-yellow-800'
        };
      default:
        return {
          accuracyBg: 'bg-blue-50',
          responseBg: 'bg-purple-50',
          fastestBg: 'bg-green-50',
          practiceBg: 'bg-amber-50',
          accuracyText: 'text-blue-800',
          responseText: 'text-purple-800',
          fastestText: 'text-green-800',
          practiceText: 'text-amber-800'
        };
    }
  };

  const cardStyles = getCardStyles();
  const practiceLabel = getPracticeLabel();
  
  // Get specific icon for problem type
  const getProblemTypeIcon = (): ReactElement => {
    switch (problemType) {
      case ProblemType.MULTIPLICATION:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case ProblemType.MISSING_FACTOR:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ProblemType.DIVISION:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return <></>;
    }
  };
  
  const typeIcon = getProblemTypeIcon();
  
  // Style for the practice text based on problem type
  const practiceTextStyle = problemType === ProblemType.MISSING_FACTOR
    ? 'text-lg font-bold text-center' // Slightly smaller font for longer missing factor format
    : 'text-xl font-bold text-center';
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      {/* Problem type indicator */}
      <div className="flex items-center justify-center mb-3 gap-1.5">
        <span className="font-medium text-gray-600">
          {problemTypeLabel} Session
        </span>
        <div className={`p-1 rounded-full ${cardStyles.accuracyBg}`}>
          {typeIcon}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className={`${cardStyles.accuracyBg} rounded-lg p-2 flex flex-col items-center`}>
          <div className="text-xs text-blue-600 font-medium">Accuracy</div>
          <div className={`text-2xl font-bold ${cardStyles.accuracyText}`}>{stats.correctPercentage}%</div>
          <div className="text-xs text-gray-500">
            {stats.correctCount}/{stats.totalCount} correct
          </div>
        </div>
        
        <div className={`${cardStyles.responseBg} rounded-lg p-2 flex flex-col items-center`}>
          <div className="text-xs text-purple-600 font-medium">Avg Response</div>
          <div className={`text-2xl font-bold ${cardStyles.responseText}`}>{formatTime(stats.avgResponseTime)}</div>
        </div>
        
        <div className={`${cardStyles.fastestBg} rounded-lg p-2 flex flex-col items-center`}>
          <div className="text-xs text-green-600 font-medium">Fastest</div>
          <div className={`text-2xl font-bold ${cardStyles.fastestText}`}>{formatTime(stats.fastestTime)}</div>
        </div>
        
        <div className={`${cardStyles.practiceBg} rounded-lg p-2 flex flex-col items-center`}>
          <div className="text-xs text-amber-600 font-medium">{practiceLabel}</div>
          <div className={`${practiceTextStyle} ${cardStyles.practiceText}`}>{stats.needsMostPractice}</div>
        </div>
      </div>

    </div>
  );
};

export default StatsSummary;