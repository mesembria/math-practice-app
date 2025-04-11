// src/components/SessionSummary/MasteryGrid.tsx
import React from 'react';
import { ProblemType } from '../../services/api';
import { getWeightColor } from './utils/formatters';

// Define a type that matches what's coming from the backend/SessionSummary
interface ProblemWeightItem {
  factor1: number;
  factor2: number;
  weight: number;
  problemType?: ProblemType; // Make this optional to match actual data
}

interface MasteryGridProps {
  problemWeights: ProblemWeightItem[]; // Use our flexible type here
  problemType: ProblemType;
}

const MasteryGrid: React.FC<MasteryGridProps> = ({ problemWeights, problemType }) => {
  // Filter weights to only show the ones for the current problem type
  // If problemType is not present on weights (older API response), show all weights
  const filteredWeights = problemWeights.filter(weight => 
    !('problemType' in weight) || weight.problemType === problemType || weight.problemType === undefined
  );
  
  // Use 12x12 grid for both multiplication and missing factor types (factors 2-12)
  // This makes the grid consistent across problem types
  const minFactor = 2;
  const maxFactor = 12; // Always use 12 as max factor for both types
  
  // Generate an array of factors to display in the grid
  const factors = Array.from({ length: maxFactor - minFactor + 1 }, (_, i) => i + minFactor);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
      {/* Compact responsive grid - now uses 11 columns for both types (11 = 12-2+1) */}
      <div className="grid grid-cols-[auto_repeat(11,1fr)] gap-px bg-gray-100 rounded-lg overflow-hidden">
        {/* Column headers */}
        <div className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">
          {problemType === ProblemType.MISSING_FACTOR ? 'M' : '×'}
        </div>
        {factors.map(num => (
          <div key={num} className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">
            {num}
          </div>
        ))}
        
        {/* Grid rows */}
        {factors.map(row => (
          <React.Fragment key={row}>
            {/* Row header */}
            <div className="text-center font-medium text-gray-600 p-0.5 bg-gray-50 text-xs">
              {row}
            </div>
            
            {/* Cells */}
            {factors.map(col => {
              // Find the weight for this problem combination
              const weight = filteredWeights.find(
                w => (w.factor1 === row && w.factor2 === col) ||
                     (w.factor1 === col && w.factor2 === row)
              );
              
              // Use default weight (10) if no data available
              const cellColor = weight ? getWeightColor(weight.weight) : 'rgb(229, 231, 235)';
              const product = row * col;
              
              // Create descriptive tooltip text based on problem type
              let masteryStatus = 'No practice data yet';
              if (weight) {
                if (weight.weight < 5) masteryStatus = 'Well mastered';
                else if (weight.weight < 8) masteryStatus = 'Good progress';
                else if (weight.weight < 12) masteryStatus = 'Still learning';
                else if (weight.weight < 16) masteryStatus = 'Needs practice';
                else masteryStatus = 'Needs focused attention';
              }
              
              const tooltipText = problemType === ProblemType.MISSING_FACTOR 
                ? `Missing factor: ${row} × ? = ${product} or ? × ${col} = ${product}\n${masteryStatus}${weight ? ` (weight: ${weight.weight.toFixed(1)})` : ''}`
                : `${row} × ${col} = ${product}\n${masteryStatus}${weight ? ` (weight: ${weight.weight.toFixed(1)})` : ''}`;
              
              // For problematic cells, add a highlight
              const isNeedsPractice = weight && weight.weight > 12;
              const isMastered = weight && weight.weight < 5;
              
              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative w-full aspect-square flex items-center justify-center text-xs font-medium text-gray-700 ${problemType === ProblemType.MISSING_FACTOR ? 'border border-transparent' : ''}`}
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