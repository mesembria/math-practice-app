import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SessionSummary from './SessionSummary';
import { SessionSummary as SessionSummaryType } from '../../services/api';


describe('SessionSummary', () => {
  const mockSummary: SessionSummaryType = {
    attempts: [
      {
        factor1: 2,
        factor2: 3,
        isCorrect: true,
        responseTime: 2000,
        averageTime: 3000
      },
      {
        factor1: 4,
        factor2: 5,
        isCorrect: false,
        responseTime: 5000,
        averageTime: 4000
      }
    ],
    problemWeights: [
      {
        factor1: 2,
        factor2: 3,
        weight: 6 // default weight (2 * 3)
      },
      {
        factor1: 4,
        factor2: 5,
        weight: 25 // higher than default (4 * 5 = 20)
      }
    ]
  };

  it('renders problem attempts with correctness indicators', () => {
    render(<SessionSummary summary={mockSummary} />);
    
    // Check problem expressions
    expect(screen.getByText('2 × 3 = 6')).toBeInTheDocument();
    expect(screen.getByText('4 × 5 = 20')).toBeInTheDocument();
    
    // Check correctness indicators
    const checkmarks = screen.getAllByText('✓');
    const crosses = screen.getAllByText('✗');
    expect(checkmarks).toHaveLength(1);
    expect(crosses).toHaveLength(1);
  });

  it('renders the multiplication grid', () => {
    render(<SessionSummary summary={mockSummary} />);
    
    // Check grid headers
    for (let i = 2; i <= 10; i++) {
      // Each number appears twice - once in row headers, once in column headers
      const elements = screen.getAllByText(i.toString());
      expect(elements).toHaveLength(2);
    }
  });

  it('renders explanatory text', () => {
    render(<SessionSummary summary={mockSummary} />);
    
    expect(screen.getByText(/For each problem, see your answer's correctness/)).toBeInTheDocument();
    expect(screen.getByText(/This grid shows your progress/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SessionSummary summary={mockSummary} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
