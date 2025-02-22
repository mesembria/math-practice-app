import React, { useCallback, useEffect } from 'react';

interface NumericKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  className?: string;
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength,
  className = '',
}) => {
  const handleInput = useCallback((input: string) => {
    // Handle backspace
    if (input === 'backspace') {
      if (value === '0' || value.length <= 1) {
        onChange('0');
      } else {
        onChange(value.slice(0, -1));
      }
      return;
    }

    // Don't exceed maxLength
    if (maxLength && value.length >= maxLength) {
      return;
    }

    // Handle digit input
    if (value === '0') {
      if (input === '0') {
        return; // Prevent multiple leading zeros
      }
      onChange(input); // Replace initial zero
    } else {
      onChange(value + input); // Append digit
    }
  }, [value, onChange, maxLength]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        handleInput('backspace');
      } else if (e.key === 'Enter' && onSubmit) {
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, onSubmit]);

  const buttons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', 'backspace']
  ];

  const baseButtonStyles = `
    flex items-center justify-center
    text-2xl font-bold
    rounded-xl
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-400
    active:scale-95
    touch-manipulation
    select-none
    h-16 md:h-20
  `;

  const numberButtonStyles = `
    bg-blue-100 hover:bg-blue-200
    text-blue-900
    active:bg-blue-300
  `;

  const backspaceButtonStyles = `
    bg-red-100 hover:bg-red-200
    text-red-900
    active:bg-red-300
    col-span-2
  `;

  return (
    <div 
      className={`grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl shadow-lg ${className}`}
      role="group"
      aria-label="Numeric keyboard"
    >
      {buttons.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {row.map((digit) => (
            <button
              key={digit}
              onClick={() => handleInput(digit)}
              className={`
                ${baseButtonStyles}
                ${digit === 'backspace' ? backspaceButtonStyles : numberButtonStyles}
              `}
              aria-label={digit === 'backspace' ? 'Backspace' : `Number ${digit}`}
              role={digit === 'backspace' ? 'button' : 'spinbutton'}
            >
              {digit === 'backspace' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L21 14"
                  />
                </svg>
              ) : (
                digit
              )}
            </button>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NumericKeyboard;
