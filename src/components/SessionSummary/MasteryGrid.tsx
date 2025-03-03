import React from 'react';
import { ProblemWeight } from '../../services/api';
import { getWeightColor } from './utils/formatters';

interface MasteryGridProps {
  problemWeights: ProblemWeight[];
}

const MasteryGrid: React.FC<MasteryGridProps> = ({ problemWeights }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-2 border border-gray-100">

      
      {/* Compact responsive grid */}
      <div className="grid grid-cols-10 gap-px bg-gray-100 rounded-lg overflow-hidden">
        {/* Column headers */}
        <div className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">×</div>
        {[2,3,4,5,6,7,8,9,10].map(num => (
          <div key={num} className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">
            {num}
          </div>
        ))}
        
        {/* Grid rows */}
        {[2,3,4,5,6,7,8,9,10].map(row => (
          <React.Fragment key={row}>
            {/* Row header */}
            <div className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">
              {row}
            </div>
            
            {/* Cells */}
            {[2,3,4,5,6,7,8,9,10].map(col => {
              // Find the weight for this problem combination
              const weight = problemWeights.find(
                w => (w.factor1 === row && w.factor2 === col) ||
                     (w.factor1 === col && w.factor2 === row)
              );
              
              // Use default weight (10) if no data available
              const cellColor = weight ? getWeightColor(weight.weight) : 'rgb(229, 231, 235)';
              const product = row * col;
              
              // Create descriptive tooltip text
              let masteryStatus = 'No practice data yet';
              if (weight) {
                if (weight.weight < 5) masteryStatus = 'Well mastered';
                else if (weight.weight < 8) masteryStatus = 'Good progress';
                else if (weight.weight < 12) masteryStatus = 'Still learning';
                else if (weight.weight < 16) masteryStatus = 'Needs practice';
                else masteryStatus = 'Needs focused attention';
              }
              
              const tooltipText = `${row} × ${col} = ${product}\n${masteryStatus}${weight ? ` (weight: ${weight.weight.toFixed(1)})` : ''}`;
              
              // For problematic cells, add a highlight
              const isNeedsPractice = weight && weight.weight > 12;
              const isMastered = weight && weight.weight < 5;
              
              return (
                <div
                  key={`${row}-${col}`}
                  className="relative w-full aspect-square flex items-center justify-center text-xs font-medium text-gray-700"
                  style={{ backgroundColor: cellColor }}
                  title={tooltipText}
                >
                  {product}
                  
                  {/* Only show indicators for extreme cases to reduce visual noise */}
                  {isNeedsPractice && (
                    <div className="absolute top-0 right-0 h-1 w-1 bg-red-500 rounded-full" 
                         title="High priority for practice"/>
                  )}
                  
                  {isMastered && (
                    <div className="absolute bottom-0 right-0 h-1 w-1 bg-green-500 rounded-full"
                         title="Well mastered"/>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Simplified compact legend */}
      <div className="flex justify-center gap-2 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getWeightColor(5) }}></div>
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-gray-200"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getWeightColor(15) }}></div>
          <span>Needs practice</span>
        </div>
      </div>
    </div>
  );
};

export default MasteryGrid;