import React from 'react';

interface MissingFactorNumberLineProps {
  known: number;
  missing: number;
  product: number;
  problemText: string;
}

/**
 * Visual representation of missing factor problems as jumps on a number line
 * Best for medium products (up to 100)
 */
const MissingFactorNumberLine: React.FC<MissingFactorNumberLineProps> = ({
  known,
  missing,
  product,
  problemText
}) => {
  return (
    <div className="p-2 bg-white rounded border border-yellow-200 my-2">
      <p>For the problem: {problemText}</p>
      <p className="my-2">Think of it as: {product} ÷ {known} = ?</p>
      <div className="mt-3 mb-2">
        <p className="mb-1">Visual method: How many jumps of {known} do we need to reach {product}?</p>
        <div className="relative h-16 bg-gray-100 rounded my-4">
          {/* Number line */}
          <div className="absolute bottom-0 w-full h-1 bg-gray-400"></div>
          
          {/* Start marker */}
          <div className="absolute bottom-0 left-4 h-3 w-1 bg-gray-600"></div>
          <div className="absolute bottom-4 left-2 text-xs">0</div>
          
          {/* Jumps */}
          {[...Array(Math.min(missing, 4))].map((_, i) => (
            <React.Fragment key={i}>
              <div className="absolute bottom-0" style={{ left: `${(i+1) * (80/Math.max(missing, 4)) + 4}%` }}>
                <div className="h-3 w-1 bg-gray-600"></div>
                <div className="absolute bottom-4 transform -translate-x-1/2 text-xs">{known * (i+1)}</div>
              </div>
              {/* Arrow */}
              <div className="absolute bottom-8" style={{ left: `${(i * (80/Math.max(missing, 4)) + 4 + (40/Math.max(missing, 4)))}%` }}>
                <div className="text-green-500 text-xs font-bold">+{known}</div>
                <svg className="w-12 h-4 text-green-500" viewBox="0 0 24 8" fill="none">
                  <path d="M0 4H22M22 4L18 1M22 4L18 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </React.Fragment>
          ))}
          
          {missing > 4 && (
            <div className="absolute right-12 bottom-8 text-green-600 text-xs">...more jumps</div>
          )}
          
          {/* Final marker */}
          <div className="absolute bottom-0 right-4 h-3 w-1 bg-gray-600"></div>
          <div className="absolute bottom-4 right-2 text-xs font-bold text-green-600">{product}</div>
        </div>
        <p className="text-sm">It takes {missing} jumps of {known} to reach {product}</p>
      </div>
    </div>
  );
};

export default MissingFactorNumberLine;