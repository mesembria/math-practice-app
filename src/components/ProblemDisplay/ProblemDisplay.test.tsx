import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProblemDisplay from './ProblemDisplay';

describe('ProblemDisplay', () => {
  it('renders multiplication problem correctly', () => {
    render(<ProblemDisplay factor1={4} factor2={6} answer="0" />);
    const problem = screen.getByRole('region');
    expect(problem).toHaveTextContent('4 × 6 =');
    expect(problem).not.toHaveTextContent('4 × 6 = 0');
  });

  it('applies custom className when provided', () => {
    render(<ProblemDisplay factor1={3} factor2={5} answer="0" className="custom-class" />);
    const container = screen.getByRole('region');
    expect(container.className).toContain('custom-class');
  });

  it('throws error for invalid factor1', () => {
    expect(() => {
      render(<ProblemDisplay factor1={1} factor2={5} answer="0" />);
    }).toThrow('Factors must be between 2 and 10');

    expect(() => {
      render(<ProblemDisplay factor1={11} factor2={5} answer="0" />);
    }).toThrow('Factors must be between 2 and 10');
  });

  it('throws error for invalid factor2', () => {
    expect(() => {
      render(<ProblemDisplay factor1={5} factor2={1} answer="0" />);
    }).toThrow('Factors must be between 2 and 10');

    expect(() => {
      render(<ProblemDisplay factor1={5} factor2={11} answer="0" />);
    }).toThrow('Factors must be between 2 and 10');
  });

  it('meets accessibility requirements', () => {
    render(<ProblemDisplay factor1={7} factor2={8} answer="0" />);
    const problem = screen.getByRole('region');
    
    // Check for ARIA label
    expect(problem).toHaveAttribute('aria-label', 'multiplication problem');
    
    // Verify semantic structure
    expect(problem.querySelector('p')).toBeTruthy();
  });

  it('maintains consistent layout with different number lengths', () => {
    const { rerender } = render(<ProblemDisplay factor1={2} factor2={3} answer="0" />);
    const singleDigitProblem = screen.getByRole('region').textContent;
    
    rerender(<ProblemDisplay factor1={10} factor2={8} answer="0" />);
    const doubleDigitProblem = screen.getByRole('region').textContent;
    
    // Verify spacing is maintained
    expect(singleDigitProblem?.includes(' × ')).toBeTruthy();
    expect(doubleDigitProblem?.includes(' × ')).toBeTruthy();
  });
});
