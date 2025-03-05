import React, { useEffect } from 'react';

interface EncouragementMessageProps {
  message: string;
  isVisible: boolean;
  onAnimationComplete: () => void;
}

/**
 * Displays an encouraging message with enhanced animation effects
 * Positioned at the bottom center of the problem display area
 */
const EncouragementMessage: React.FC<EncouragementMessageProps> = ({
  message,
  isVisible,
  onAnimationComplete,
}) => {
  // Handle the animation end
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 500); // Slightly longer than the CSS transition to ensure it completes
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <div 
      className={`
        fixed top-10 left-1/2 transform -translate-x-1/2
        py-3 px-6 
        rounded-xl 
        bg-blue-50 
        border border-blue-200
        text-lg font-medium text-blue-800
        shadow-md
        transition-all duration-500 ease-in-out
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-4'}
        z-30
      `}
      aria-live="polite"
      role="status"
      style={{
        // Add subtle animation with spring-like bounce effect
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        // Add subtle glow effect when visible
        boxShadow: isVisible 
          ? '0 0 15px rgba(59, 130, 246, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {message}
    </div>
  );
};

export default EncouragementMessage;