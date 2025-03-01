import React from 'react';
import { SessionStats } from './utils/calculations';
import { formatTime } from './utils/formatters';

interface StatsSummaryProps {
  stats: SessionStats;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Session Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
          <div className="text-sm text-blue-600 font-medium">Accuracy</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-2xl font-bold text-blue-800">{stats.correctPercentage}%</span>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 flex flex-col items-center">
          <div className="text-sm text-purple-600 font-medium">Avg Response</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-2xl font-bold text-purple-800">{formatTime(stats.avgResponseTime)}</span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center">
          <div className="text-sm text-green-600 font-medium">Fastest</div>
          <div className="text-2xl font-bold text-green-800">{formatTime(stats.fastestTime)}</div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-3 flex flex-col items-center">
          <div className="text-sm text-amber-600 font-medium">Needs Practice</div>
          <div className="text-2xl font-bold text-amber-800">{stats.needsMostPractice}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;