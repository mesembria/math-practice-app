import React from 'react';

interface CompletionMessageProps {
  correctCount: number;
  totalProblems: number;
}

/**
 * Displays a celebratory message when the exercise is completed
 */
const CompletionMessage: React.FC<CompletionMessageProps> = ({ correctCount, totalProblems }) => (
  <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 p-4">
    <div className="text-3xl font-bold text-green-600 animate-bounce">
      {correctCount === totalProblems ? 
        "Perfect Score! 🎉" : 
        "Exercise Complete! 🎊"}
    </div>
    <div className="text-xl">
      You got <span className="font-bold text-blue-600">{correctCount}</span> out of <span className="font-bold">{totalProblems}</span> correct!
    </div>
    <p className="text-gray-600">Full summary loading...</p>
  </div>
);

export default CompletionMessage;