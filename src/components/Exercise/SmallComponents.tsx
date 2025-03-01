import React from 'react';

/**
 * Shows a pause overlay when the exercise is paused
 */
export const PauseOverlay: React.FC<{ onResume: () => void }> = ({ onResume }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
    <h3 className="text-2xl font-bold text-gray-800 mb-4">Session Paused</h3>
    <p className="text-gray-600 mb-6">Take a break and resume when you're ready!</p>
    <button
      onClick={onResume}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Resume
    </button>
  </div>
);

/**
 * Displays statistics about the user's progress in the exercise
 */
export const ProgressStats: React.FC<{ results: Array<boolean | null>, totalProblems: number }> = ({ 
  results, 
  totalProblems 
}) => (
  <div className="mt-6 text-sm text-gray-600">
    Problem {results.filter(r => r !== null).length + 1} of {totalProblems}
    {results.filter(r => r === true).length > 0 && 
      ` • ${results.filter(r => r === true).length} correct`}
    {results.filter(r => r === false).length > 0 && 
      ` • ${results.filter(r => r === false).length} incorrect`}
  </div>
);

/**
 * Displays a celebratory message when the exercise is completed
 */
export const CompletionMessage: React.FC<{ correctCount: number, totalProblems: number }> = ({ 
  correctCount, 
  totalProblems 
}) => (
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

/**
 * Shows a loading screen while the exercise is being initialized
 */
export const LoadingView: React.FC = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-xl text-gray-600">Loading problems...</p>
    </div>
  </div>
);

/**
 * Displays an error message if something goes wrong
 */
export const ErrorView: React.FC<{ error: string, onReturnHome: () => void }> = ({ 
  error, 
  onReturnHome 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
    <div className="w-16 h-16 text-red-500 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-xl text-red-600">{error}</p>
    <button
      onClick={onReturnHome}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Return to Home
    </button>
  </div>
);

// Export individual components for direct imports
export default {
  PauseOverlay,
  ProgressStats,
  CompletionMessage,
  LoadingView,
  ErrorView
};