import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders correct number of squares', () => {
    render(
      <ProgressIndicator
        totalProblems={5}
        currentProblemIndex={0}
        results={[null, null, null, null, null]}
      />
    );
    const squares = screen.getAllByRole('status');
    expect(squares).toHaveLength(5);
  });

  it('highlights current problem correctly', () => {
    render(
      <ProgressIndicator
        totalProblems={3}
        currentProblemIndex={1}
        results={[true, null, null]}
      />
    );
    const squares = screen.getAllByRole('status');
    expect(squares[1]).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('displays correct colors for different states', () => {
    render(
      <ProgressIndicator
        totalProblems={4}
        currentProblemIndex={2}
        results={[true, false, null, null]}
      />
    );
    const squares = screen.getAllByRole('status');
    
    expect(squares[0]).toHaveClass('bg-green-500'); // correct
    expect(squares[1]).toHaveClass('bg-red-500');   // incorrect
    expect(squares[2]).toHaveClass('bg-gray-200');  // unattempted (current)
    expect(squares[3]).toHaveClass('bg-gray-200');  // unattempted
  });

  it('handles retry mode with lighter colors', () => {
    render(
      <ProgressIndicator
        totalProblems={3}
        currentProblemIndex={1}
        results={[true, false, null]}
        isRetry={true}
      />
    );
    const squares = screen.getAllByRole('status');
    
    expect(squares[0]).toHaveClass('bg-green-300'); // correct (lighter)
    expect(squares[1]).toHaveClass('bg-red-300');   // incorrect (lighter)
    expect(squares[2]).toHaveClass('bg-gray-100');  // unattempted (lighter)
  });

  it('applies custom className when provided', () => {
    render(
      <ProgressIndicator
        totalProblems={2}
        currentProblemIndex={0}
        results={[null, null]}
        className="custom-class"
      />
    );
    const container = screen.getByRole('progressbar');
    expect(container.className).toContain('custom-class');
  });

  it('normalizes results array to match totalProblems', () => {
    // Provide fewer results than total problems
    render(
      <ProgressIndicator
        totalProblems={4}
        currentProblemIndex={0}
        results={[true, false]}
      />
    );
    const squares = screen.getAllByRole('status');
    expect(squares).toHaveLength(4);
    expect(squares[2]).toHaveClass('bg-gray-200'); // Should be filled with null
    expect(squares[3]).toHaveClass('bg-gray-200'); // Should be filled with null
  });

  it('meets accessibility requirements', () => {
    render(
      <ProgressIndicator
        totalProblems={3}
        currentProblemIndex={1}
        results={[true, null, null]}
      />
    );
    
    // Check progressbar role and attributes
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '3');
    expect(progressbar).toHaveAttribute('aria-valuenow', '2');
    expect(progressbar).toHaveAttribute('aria-label', 'Problem 2 of 3');

    // Check individual square labels
    const squares = screen.getAllByRole('status');
    expect(squares[0]).toHaveAttribute('aria-label', 'Problem 1: correct');
    expect(squares[1]).toHaveAttribute('aria-label', 'Current problem 2');
    expect(squares[2]).toHaveAttribute('aria-label', 'Problem 3: not attempted');
  });

  it('handles edge cases gracefully', () => {
    // Test with 0 problems (should render empty)
    const { rerender } = render(
      <ProgressIndicator
        totalProblems={0}
        currentProblemIndex={0}
        results={[]}
      />
    );
    expect(screen.queryAllByRole('status')).toHaveLength(0);

    // Test with negative currentProblemIndex (should clamp to 0)
    rerender(
      <ProgressIndicator
        totalProblems={2}
        currentProblemIndex={-1}
        results={[null, null]}
      />
    );
    const squares = screen.getAllByRole('status');
    expect(squares[0]).toHaveClass('ring-2', 'ring-blue-500'); // First square should be current

    // Test with currentProblemIndex beyond totalProblems (should clamp to last index)
    rerender(
      <ProgressIndicator
        totalProblems={2}
        currentProblemIndex={5}
        results={[null, null]}
      />
    );
    expect(squares[1]).toHaveClass('ring-2', 'ring-blue-500'); // Last square should be current
  });
});
