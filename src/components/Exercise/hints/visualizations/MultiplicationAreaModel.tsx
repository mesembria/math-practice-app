import React from 'react';

interface MultiplicationAreaModelProps {
  factor1: number;
  factor2: number;
  correctProduct: number;
}

/**
 * Visual representation of multiplication as an area model
 * Best for larger numbers (when either factor > 10)
 */
const MultiplicationAreaModel: React.FC<MultiplicationAreaModelProps> = ({
  factor1,
  factor2,
  correctProduct
}) => {
  return (
    <div className="p-2 bg-white rounded border border-yellow-200 my-2">
      <p className="mb-2">{factor1} × {factor2} shown as an area model:</p>
      <div className="relative bg-blue-50 rounded border border-blue-200" 
          style={{ width: "100%", height: "140px" }}>
        {/* Area rectangle */}
        <div className="font-bold text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-700">
          {correctProduct}
        </div>
        
        {/* Width label */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-blue-700">
          {factor1}
        </div>
        
        {/* Height label */}
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-sm font-medium text-blue-700 transform -rotate-90">
          {factor2}
        </div>
      </div>
      <p className="mt-2 text-sm">The area of the rectangle (width × height) gives us the product: {correctProduct}</p>
    </div>
  );
};

export default MultiplicationAreaModel;