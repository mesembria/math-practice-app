import React from 'react';
import { Problem } from '../types';
import { isCompensationUseful } from './hintUtils';
import MultiplicationAreaModel from './visualizations/MultiplicationAreaModel';
import MultiplicationNumberLine from './visualizations/MultiplicationLineNumber';
import CompensationStrategy from './strategies/CompensationStrategy';
import MultiplicationGroups from './visualizations/MultiplicationGroups';

interface MultiplicationHintProps {
  problem: Problem;
  userAnswer: string;
  correctAnswer: number;
}

/**
 * Component that provides hints for multiplication problems
 */
const MultiplicationHint: React.FC<MultiplicationHintProps> = ({
  problem,
  userAnswer,
}) => {
  const factor1 = Number(problem.factor1);
  const factor2 = Number(problem.factor2);
  const userAnswerNum = Number(userAnswer);
  const correctProduct = factor1 * factor2;
  
  // Check if student added instead of multiplied
  if (userAnswerNum === factor1 + factor2) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Addition vs. Multiplication</h3>
        <p className="mb-2">It looks like you added the numbers instead of multiplying them.</p>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p className="font-medium">Addition:</p>
            <p>{factor1} + {factor2} = {factor1 + factor2}</p>
          </div>
          <div>
            <p className="font-medium">Multiplication:</p>
            <p>{factor1} × {factor2} = {correctProduct}</p>
          </div>
        </div>
        <p>Remember: Multiplication is like adding a number multiple times:</p>
        <div className="p-2 bg-white rounded border border-yellow-200 my-2">
          {factor1} × {factor2} means {factor2} groups of {factor1}:
          <div className="flex flex-wrap mt-1">
            {[...Array(Math.min(5, factor2))].map((_, i) => (
              <div key={i} className="border border-yellow-400 rounded p-1 m-1 bg-yellow-100">
                {factor1}
              </div>
            ))}
            {factor2 > 5 && (
              <div className="border border-yellow-400 rounded p-1 m-1 bg-yellow-100">
                ...and {factor2 - 5} more
              </div>
            )}
          </div>
          <p className="mt-1">So {factor1} + {factor1} + ... (repeated {factor2} times) = {correctProduct}</p>
        </div>
      </div>
    );
  }
  
  // Check if student got digits reversed (for double-digit answers)
  if (correctProduct >= 10 && userAnswerNum === parseInt(correctProduct.toString().split('').reverse().join(''))) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Check Your Digits</h3>
        <p>It looks like your digits may be reversed. The correct order is {correctProduct}.</p>
        <div className="p-2 bg-white rounded border border-yellow-200 my-2">
          <p>When multiplying {factor1} × {factor2}:</p>
          <ul className="list-disc list-inside">
            <li>First, think of it as {factor2} groups of {factor1}</li>
            <li>Count carefully when finding the total</li>
            <li>Remember to write your answer with digits in the correct order</li>
          </ul>
        </div>
      </div>
    );
  }
  
  // Check if compensation strategy would be useful
  if (isCompensationUseful(factor1, factor2)) {
    return <CompensationStrategy factor1={factor1} factor2={factor2} correctProduct={correctProduct} />;
  }
  
  // Choose the right visual based on the size of the numbers
  const visualType = factor1 <= 5 && factor2 <= 5 ? "groups" : 
                     (factor1 <= 10 && factor2 <= 10) ? "numberLine" : "areaModel";
  
  // Return the appropriate visualization based on the number size
  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Hint: Visualizing Multiplication</h3>
      <p className="mb-2">Here's a way to see {factor1} × {factor2} visually:</p>
      
      {visualType === "groups" && (
        <MultiplicationGroups factor1={factor1} factor2={factor2} correctProduct={correctProduct} />
      )}
      
      {visualType === "numberLine" && (
        <MultiplicationNumberLine factor1={factor1} factor2={factor2} correctProduct={correctProduct} />
      )}
      
      {visualType === "areaModel" && (
        <MultiplicationAreaModel factor1={factor1} factor2={factor2} correctProduct={correctProduct} />
      )}
      
      <div className="mt-3 border-t border-yellow-200 pt-3">
        <h4 className="font-medium text-yellow-800">Multiplication Strategies:</h4>
        <ul className="list-disc list-inside mt-1 text-sm">
          <li>Think of multiplication as repeated addition: {factor1} added {factor2} times</li>
          <li>Use skip counting: count by {factor1}, {factor2} times</li>
          <li>Break larger numbers into smaller ones that are easier to multiply</li>
          <li>Check your answer by estimating if it seems reasonable</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplicationHint;