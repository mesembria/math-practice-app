import React from 'react';
import { SessionStats } from './utils/calculations';

interface PerformanceInsightsProps {
  stats: SessionStats;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Performance Insights</h3>
      
      <ul className="space-y-2 pl-2">
        {/* Dynamically generated insights */}
        {stats.correctPercentage < 70 && (
          <li className="flex items-start gap-2 text-red-800 bg-red-50 p-2 rounded">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Accuracy below 70%. Focus on getting correct answers before speed.</span>
          </li>
        )}
        
        {stats.correctPercentage >= 90 && (
          <li className="flex items-start gap-2 text-green-800 bg-green-50 p-2 rounded">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Great accuracy! Try improving your speed next.</span>
          </li>
        )}
        
        {stats.slowestTime > stats.avgResponseTime * 2 && (
          <li className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2 rounded">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Some problems take much longer than others. Practice consistency.</span>
          </li>
        )}
        
        <li className="flex items-start gap-2 text-blue-800 bg-blue-50 p-2 rounded">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Focus practice on: <strong>{stats.needsMostPractice}</strong></span>
        </li>
      </ul>
    </div>
  );
};

export default PerformanceInsights;