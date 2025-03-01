import React from 'react';
import { ProblemAttempt } from '../../services/api';
import { formatTime } from './utils/formatters';

interface ProblemListProps {
  attempts: ProblemAttempt[];
}

const ProblemList: React.FC<ProblemListProps> = ({ attempts }) => {
  // System-wide target response time (5 seconds) from backend configuration
  const TARGET_RESPONSE_TIME = 5000; // ms
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Problems Attempted</h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {attempts.map((attempt, index) => {
          const correctAnswer = attempt.factor1 * attempt.factor2;
          const isCorrect = attempt.isCorrect;
          
          // Determine if this attempt was faster than target
          const isFasterThanTarget = attempt.responseTime < TARGET_RESPONSE_TIME;
          
          return (
            <div 
              key={index} 
              className={`
                flex items-center gap-4 p-3 rounded-lg border 
                ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                transition-all hover:shadow-md
              `}
            >
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200">
                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg font-medium whitespace-nowrap">
                  {attempt.factor1} × {attempt.factor2} =
                </span>
                
                {isCorrect ? (
                  <span className="text-lg font-semibold text-green-700">
                    {correctAnswer}
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold text-red-600 line-through">
                      {attempt.userAnswer}
                    </span>
                    <span className="text-gray-500 text-sm">(should be {correctAnswer})</span>
                  </div>
                )}
              </div>
              
              {/* Response time indicator */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isFasterThanTarget ? 'text-green-600' : 'text-amber-600'}`}>
                      {formatTime(attempt.responseTime)}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {isFasterThanTarget ? 'Faster' : 'Slower'} than target
                    </div>
                  </div>
                  
                  {/* Speed gauge */}
                  <div 
                    className="relative w-16 h-3 bg-gray-200 rounded-full overflow-hidden flex-shrink-0"
                    title={`Response time: ${formatTime(attempt.responseTime)}, Target: ${formatTime(TARGET_RESPONSE_TIME)}`}
                  >
                    {/* Target time marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
                      style={{ left: '50%' }}
                    />
                    
                    {/* Response time indicator */}
                    <div
                      className={`absolute top-0 bottom-0 w-2 rounded-full ${
                        isFasterThanTarget ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{
                        // Position relative to target (center = target time)
                        left: `${Math.max(5, Math.min(95, 50 - ((attempt.responseTime - TARGET_RESPONSE_TIME) / TARGET_RESPONSE_TIME) * 40))}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProblemList;