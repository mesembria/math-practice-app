import React from 'react';

interface MultiplicationGroupsProps {
  factor1: number;
  factor2: number;
  correctProduct: number;
}

/**
 * Visual representation of multiplication as groups
 * Best for small numbers (factor1 ≤ 5 and factor2 ≤ 5)
 */
const MultiplicationGroups: React.FC<MultiplicationGroupsProps> = ({
  factor1,
  factor2,
  correctProduct
}) => {
  return (
    <div className="p-2 bg-white rounded border border-yellow-200 my-2">
      <p className="mb-2">{factor1} × {factor2} means {factor2} groups of {factor1}:</p>
      <div className="flex flex-wrap gap-2 mb-2 justify-center">
        {[...Array(Math.min(factor2, 5))].map((_, groupIndex) => (
          <div key={groupIndex} className="border border-blue-200 rounded p-2 bg-blue-50 text-center">
            <p className="font-bold text-blue-600 text-xl">{factor1}</p>
            <p className="text-xs text-blue-800">Group {groupIndex + 1}</p>
          </div>
        ))}
        {factor2 > 5 && (
          <div className="border border-blue-200 rounded p-2 bg-blue-50 text-center">
            <p className="text-sm text-blue-800">...and {factor2 - 5} more groups</p>
          </div>
        )}
      </div>
      <p>{factor2} groups of {factor1} equals {correctProduct}</p>
    </div>
  );
};

export default MultiplicationGroups;