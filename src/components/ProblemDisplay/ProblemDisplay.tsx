import React from 'react';

interface ProblemDisplayProps {
  factor1: number;
  factor2: number;
  className?: string;
}

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ 
  factor1, 
  factor2, 
  className = '' 
}) => {
  // Validate prop ranges
  if (factor1 < 2 || factor1 > 10 || factor2 < 2 || factor2 > 10) {
    throw new Error('Factors must be between 2 and 10');
  }

  return (
    <div 
      className={`
        flex items-center justify-center
        min-h-[200px] w-full
        bg-white rounded-lg shadow-sm
        ${className}
      `}
      role="region"
      aria-label="multiplication problem"
    >
      <p 
        className="
          text-5xl md:text-6xl font-semibold
          text-gray-800 tracking-wide
          font-['Arial']
        "
      >
        <span className="inline-block min-w-[1.5ch] text-center">{factor1}</span>
        <span className="mx-4 text-gray-600"> × </span>
        <span className="inline-block min-w-[1.5ch] text-center">{factor2}</span>
        <span className="mx-4"> =</span>
      </p>
    </div>
  );
};

export default ProblemDisplay;
