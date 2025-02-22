import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Exercise from './Exercise';

describe('Exercise', () => {
  it('renders all subcomponents correctly', () => {
    render(<Exercise />);
    
    // Check for main components
    expect(screen.getByRole('region', { name: /multiplication problem/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /numeric keyboard/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('generates valid problems within factor range', () => {
    const minFactor = 3;
    const maxFactor = 7;
    render(<Exercise minFactor={minFactor} maxFactor={maxFactor} />);
    
    // Extract numbers from problem display
    const problemText = screen.getByRole('region', { name: /multiplication problem/i }).textContent;
    const numbers = problemText?.match(/\d+/g)?.map(Number) || [];
    
    // Verify factors are within range
    expect(numbers[0]).toBeGreaterThanOrEqual(minFactor);
    expect(numbers[0]).toBeLessThanOrEqual(maxFactor);
    expect(numbers[1]).toBeGreaterThanOrEqual(minFactor);
    expect(numbers[1]).toBeLessThanOrEqual(maxFactor);
  });

  it('handles answer input and submission', () => {
    render(<Exercise />);
    
    // Initial state
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();

    // Input answer
    const numberButton = screen.getByRole('spinbutton', { name: /number 5/i });
    fireEvent.click(numberButton);
    expect(nextButton).toBeEnabled();

    // Submit answer
    fireEvent.click(nextButton);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('tracks progress correctly', () => {
    const numberOfProblems = 5;
    render(<Exercise numberOfProblems={numberOfProblems} />);
    
    // Complete first problem
    fireEvent.click(screen.getByRole('spinbutton', { name: /number 5/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify progress
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', String(numberOfProblems));
  });

  it('shows completion screen after all problems', () => {
    const numberOfProblems = 2;
    render(<Exercise numberOfProblems={numberOfProblems} />);
    
    // Complete all problems
    for (let i = 0; i < numberOfProblems; i++) {
      fireEvent.click(screen.getByRole('spinbutton', { name: /number 5/i }));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    
    // Check for completion screen
    expect(screen.getByText(/exercise complete/i)).toBeInTheDocument();
    expect(screen.getByText(/you got \d+ out of \d+ correct/i)).toBeInTheDocument();
  });

  it('handles keyboard input', () => {
    render(<Exercise />);
    
    // Type answer using keyboard
    fireEvent.keyDown(document, { key: '4' });
    fireEvent.keyDown(document, { key: '2' });
    
    // Verify input
    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Submit with enter
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('validates props correctly', () => {
    const { rerender } = render(<Exercise />);
    
    // Default props
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '10');
    
    // Custom props
    rerender(<Exercise numberOfProblems={5} minFactor={3} maxFactor={7} />);
    const problemText = screen.getByRole('region', { name: /multiplication problem/i }).textContent;
    const numbers = problemText?.match(/\d+/g)?.map(Number) || [];
    
    expect(numbers[0]).toBeGreaterThanOrEqual(3);
    expect(numbers[0]).toBeLessThanOrEqual(7);
    expect(numbers[1]).toBeGreaterThanOrEqual(3);
    expect(numbers[1]).toBeLessThanOrEqual(7);
  });
});
