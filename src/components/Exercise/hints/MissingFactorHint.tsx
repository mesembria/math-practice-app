import React from 'react';
import { Problem } from '../types';
import MissingFactorGroups from './visualizations/MissingFactorGroup';
import MissingFactorNumberLine from './visualizations/MissingFactorNumberLine';
import MissingFactorTriangle from './visualizations/MissingFactorTriangle';


interface MissingFactorHintProps {
  problem: Problem;
  userAnswer: string;
  correctAnswer: number;
}

/**
 * Component that provides hints for missing factor problems
 */
const MissingFactorHint: React.FC<MissingFactorHintProps> = ({
  problem,
  userAnswer,
}) => {
  const isMissingFirst = problem.missingOperandPosition === 'first';
  const knownFactor = Number(isMissingFirst ? problem.factor2 : problem.factor1);
  const missingFactor = Number(isMissingFirst ? problem.factor1 : problem.factor2);
  const product = Number(problem.product);
  const userAnswerNum = Number(userAnswer);
  
  // Format the problem text for display
  const getProblemText = () => {
    if (isMissingFirst) {
      return `? × ${knownFactor} = ${product}`;
    } else {
      return `${knownFactor} × ? = ${product}`;
    }
  };
  
  // Check if student added/subtracted instead of dividing
  if (userAnswerNum === product + knownFactor || userAnswerNum === product - knownFactor) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Finding a Missing Factor</h3>
        <p className="mb-2">To find a missing factor, we need to divide, not add or subtract.</p>
        <div className="p-2 bg-white rounded border border-yellow-200 my-2">
          <p>When trying to find the missing number in:</p>
          <p className="font-medium my-2">{getProblemText()}</p>
          <p>Think: "What number times {knownFactor} equals {product}?"</p>
          <p className="mt-2">This means we can divide: {product} ÷ {knownFactor} = {missingFactor}</p>
        </div>
      </div>
    );
  }
  
  // Choose the right visual aid based on the size of the numbers
  const visualType = product <= 20 ? "groups" : 
                     product <= 100 ? "numberLine" : "factTriangle";
  
  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Finding the Missing Factor</h3>
      <p className="mb-2">When we need to find a missing factor, we can use division.</p>
      
      {visualType === "groups" && (
        <MissingFactorGroups 
          known={knownFactor} 
          missing={missingFactor} 
          product={product} 
          problemText={getProblemText()} 
        />
      )}
      
      {visualType === "numberLine" && (
        <MissingFactorNumberLine 
          known={knownFactor} 
          missing={missingFactor} 
          product={product} 
          problemText={getProblemText()} 
        />
      )}
      
      {visualType === "factTriangle" && (
        <MissingFactorTriangle 
          known={knownFactor} 
          missing={missingFactor} 
          product={product} 
          problemText={getProblemText()} 
        />
      )}
      
      <div className="mt-3">
        <p>Remember these steps:</p>
        <ol className="list-decimal list-inside mt-1 text-sm">
          <li>Identify what is missing (first or second factor)</li>
          <li>Divide the product by the known factor</li>
          <li>Check your answer by multiplying to make sure you get back to the original product</li>
        </ol>
      </div>
    </div>
  );
};

export default MissingFactorHint;