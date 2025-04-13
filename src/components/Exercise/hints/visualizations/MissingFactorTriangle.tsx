import React from 'react';

interface MissingFactorTriangleProps {
  known: number;
  missing: number;
  product: number;
  problemText: string;
}

/**
 * Visual representation of missing factor problems using a fact family triangle
 * Best for larger products (over 100)
 */
const MissingFactorTriangle: React.FC<MissingFactorTriangleProps> = ({
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
        <p>Using a fact family triangle:</p>
        <div className="w-48 h-48 mx-auto my-4 relative">
          {/* Triangle */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 10,90 90,90" fill="none" stroke="#38A169" strokeWidth="2" />
          </svg>
          
          {/* Product at top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center border-2 border-green-400">
            <span className="font-bold text-green-700">{product}</span>
          </div>
          
          {/* Known factor on bottom left */}
          <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center border-2 border-blue-400">
            <span className="font-bold text-blue-700">{known}</span>
          </div>
          
          {/* Missing factor on bottom right */}
          <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center border-2 border-yellow-400">
            <span className="font-bold text-yellow-700">?</span>
          </div>
          
          {/* Equations */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded border border-gray-200">
            <p className="text-sm">{known} × ? = {product}</p>
            <p className="text-sm">{product} ÷ {known} = ?</p>
          </div>
        </div>
        <p className="text-center text-sm">The missing factor is: {missing}</p>
      </div>
    </div>
  );
};

export default MissingFactorTriangle;