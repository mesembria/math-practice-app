import React from 'react';

interface MissingFactorGroupsProps {
  known: number;
  missing: number;
  product: number;
  problemText: string;
}

/**
 * Visual representation of missing factor problems as groups
 * Best for smaller products (up to 20)
 */
const MissingFactorGroups: React.FC<MissingFactorGroupsProps> = ({
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
        <p>Visual method: Make groups of {known} until you use all {product} items:</p>
        <div className="flex flex-wrap mt-1 justify-center">
          {[...Array(Math.min(missing, 5))].map((_, groupIndex) => (
            <div key={groupIndex} className="border border-green-200 rounded p-2 m-1 bg-green-50">
              <p className="text-xs text-center mb-1">Group {groupIndex + 1}</p>
              <div className="flex flex-wrap justify-center">
                {[...Array(Math.min(known, 10))].map((_, itemIndex) => (
                  <div key={itemIndex} className="w-5 h-5 m-1 bg-green-500 rounded-full"></div>
                ))}
                {known > 10 && <p className="text-xs text-center">+{known - 10} more</p>}
              </div>
            </div>
          ))}
          {missing > 5 && (
            <div className="border border-green-200 rounded p-2 m-1 bg-green-50 flex items-center">
              <p className="text-sm">...and {missing - 5} more groups</p>
            </div>
          )}
        </div>
        <p className="mt-2">Total groups needed: {missing}</p>
      </div>
    </div>
  );
};

export default MissingFactorGroups;