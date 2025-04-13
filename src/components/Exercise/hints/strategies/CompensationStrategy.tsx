import React from 'react';

interface CompensationStrategyProps {
  factor1: number;
  factor2: number;
  correctProduct: number;
}

/**
 * Provides a hint using the compensation or "friendly number" strategy for multiplication
 * This strategy helps when one factor is close to a multiple of 10
 */
const CompensationStrategy: React.FC<CompensationStrategyProps> = ({
  factor1,
  factor2,
  correctProduct
}) => {
  // Determine which factor to adjust and how
  let adjustFactor, otherFactor, adjustment, friendlyNumber;
  
  if (factor1 % 10 === 9 || factor1 % 10 === 8) {
    adjustFactor = factor1;
    otherFactor = factor2;
    adjustment = 10 - (factor1 % 10);
    friendlyNumber = factor1 + adjustment;
  } else if (factor1 % 10 === 1 || factor1 % 10 === 2) {
    adjustFactor = factor1;
    otherFactor = factor2;
    adjustment = -(factor1 % 10);
    friendlyNumber = factor1 + adjustment;
  } else if (factor2 % 10 === 9 || factor2 % 10 === 8) {
    adjustFactor = factor2;
    otherFactor = factor1;
    adjustment = 10 - (factor2 % 10);
    friendlyNumber = factor2 + adjustment;
  } else {
    adjustFactor = factor2;
    otherFactor = factor1;
    adjustment = -(factor2 % 10);
    friendlyNumber = factor2 + adjustment;
  }
  
  const easyProduct = friendlyNumber * otherFactor;
  const compensation = Math.abs(adjustment) * otherFactor;
  
  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Using Friendly Numbers</h3>
      <p className="mb-2">You can make this multiplication easier by changing {adjustFactor} to a friendly number!</p>
      
      <div className="p-3 bg-white rounded border border-yellow-200 my-2">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="font-bold text-blue-700">1</span>
          </div>
          <p>Change {adjustFactor} to {friendlyNumber} (a friendlier number to work with)</p>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="font-bold text-blue-700">2</span>
          </div>
          <p>Multiply: {friendlyNumber} × {otherFactor} = {easyProduct}</p>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="font-bold text-blue-700">3</span>
          </div>
          <p>Fix your answer: {adjustment > 0 ? 
            `Since we added ${adjustment} to ${adjustFactor}, we need to subtract ${compensation}` : 
            `Since we subtracted ${Math.abs(adjustment)} from ${adjustFactor}, we need to add ${compensation}`}</p>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <span className="font-bold text-green-700">✓</span>
          </div>
          <p>{friendlyNumber} × {otherFactor} {adjustment > 0 ? '−' : '+'} {compensation} = {correctProduct}</p>
        </div>
      </div>
      
      <div className="mt-3 bg-blue-50 p-2 rounded">
        <p className="text-blue-800 text-sm">
          This strategy works well whenever a number is close to an easy number like 10, 20, 50, or 100.
        </p>
      </div>
    </div>
  );
};

export default CompensationStrategy;