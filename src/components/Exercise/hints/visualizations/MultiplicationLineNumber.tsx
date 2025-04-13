import React from 'react';

interface MultiplicationNumberLineProps {
  factor1: number;
  factor2: number;
  correctProduct: number;
}

/**
 * Visual representation of multiplication as jumps on a number line
 * Best for medium-sized numbers (factors ≤ 10)
 */
const MultiplicationNumberLine: React.FC<MultiplicationNumberLineProps> = ({
  factor1,
  factor2,
  correctProduct
}) => {
  return (
    <div className="p-2 bg-white rounded border border-yellow-200 my-2">
      <p className="mb-2">{factor1} × {factor2} shown as jumps on a number line:</p>
      <div className="relative h-16 bg-gray-100 rounded my-4 overflow-hidden">
        {/* Number line */}
        <div className="absolute bottom-0 w-full h-1 bg-gray-400"></div>
        
        {/* Start marker */}
        <div className="absolute bottom-0 left-4 h-3 w-1 bg-gray-600"></div>
        <div className="absolute bottom-4 left-2 text-xs">0</div>
        
        {/* Jumps */}
        {[...Array(Math.min(factor2, 5))].map((_, i) => (
          <React.Fragment key={i}>
            <div className="absolute bottom-0" style={{ left: `${(i+1) * (80/Math.max(factor2, 5)) + 4}%` }}>
              <div className="h-3 w-1 bg-gray-600"></div>
              <div className="absolute bottom-4 transform -translate-x-1/2 text-xs">{factor1 * (i+1)}</div>
            </div>
            {/* Arrow */}
            <div className="absolute bottom-8" style={{ left: `${(i * (80/Math.max(factor2, 5)) + 4 + (40/Math.max(factor2, 5)))}%` }}>
              <div className="text-blue-500 text-xs font-bold">+{factor1}</div>
              <svg className="w-12 h-4 text-blue-500" viewBox="0 0 24 8" fill="none">
                <path d="M0 4H22M22 4L18 1M22 4L18 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </React.Fragment>
        ))}
        
        {factor2 > 5 && (
          <div className="absolute right-4 bottom-8 text-blue-500 text-xs">
            ...and {factor2 - 5} more jumps of {factor1}
          </div>
        )}
        
        {/* Final marker */}
        <div className="absolute bottom-0 right-4 h-3 w-1 bg-gray-600"></div>
        <div className="absolute bottom-4 right-2 text-xs font-bold text-green-600">{correctProduct}</div>
      </div>
      <p className="text-sm">Each jump adds {factor1}, and we make {factor2} jumps to get {correctProduct}</p>
    </div>
  );
};

export default MultiplicationNumberLine;