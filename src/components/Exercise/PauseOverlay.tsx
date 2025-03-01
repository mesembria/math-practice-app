import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
}

/**
 * Shows a pause overlay when the exercise is paused
 */
const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => (
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

export default PauseOverlay;