import React from 'react';

interface ErrorViewProps {
  error: string;
  onReturnHome: () => void;
}

/**
 * Displays an error message if something goes wrong
 */
const ErrorView: React.FC<ErrorViewProps> = ({ error, onReturnHome }) => (
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

export default ErrorView;