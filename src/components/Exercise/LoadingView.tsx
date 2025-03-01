import React from 'react';

/**
 * Shows a loading screen while the exercise is being initialized
 */
const LoadingView: React.FC = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-xl text-gray-600">Loading problems...</p>
    </div>
  </div>
);

export default LoadingView;