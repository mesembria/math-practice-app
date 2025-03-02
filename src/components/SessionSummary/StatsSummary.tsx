import React from 'react';
import { SessionStats } from './utils/calculations';
import { formatTime } from './utils/formatters';

interface StatsSummaryProps {
  stats: SessionStats;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 flex flex-col items-center">
          <div className="text-xs text-blue-600 font-medium">Accuracy</div>
          <div className="text-2xl font-bold text-blue-800">{stats.correctPercentage}%</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-2 flex flex-col items-center">
          <div className="text-xs text-purple-600 font-medium">Avg Response</div>
          <div className="text-2xl font-bold text-purple-800">{formatTime(stats.avgResponseTime)}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-2 flex flex-col items-center">
          <div className="text-xs text-green-600 font-medium">Fastest</div>
          <div className="text-2xl font-bold text-green-800">{formatTime(stats.fastestTime)}</div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-2 flex flex-col items-center">
          <div className="text-xs text-amber-600 font-medium">Needs Practice</div>
          <div className="text-xl font-bold text-amber-800">{stats.needsMostPractice}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;