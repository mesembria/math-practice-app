import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SessionSummary from './SessionSummary';
import { SessionSummary as SessionSummaryType } from '../../services/api';


describe('SessionSummary', () => {
  const mockSummary: SessionSummaryType = {
    sessionStats: {
      totalProblems: 2,
      correctAnswers: 1,
      accuracy: 50,
      averageResponseTime: 3500,
      completedAt: new Date().toISOString()
    },
    attempts: [
      {
        factor1: 2,
        factor2: 3,
        isCorrect: true,
        responseTime: 2000,
        averageTime: 3000,
        userAnswer: 6
      },
      {
        factor1: 4,
        factor2: 5,
        isCorrect: false,
        responseTime: 5000,
        averageTime: 4000,
        userAnswer: 25
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
    // Find the problem attempts section
    const problemsSection = screen.getByRole('heading', { name: /Problems Attempted/i }).parentElement;
    expect(problemsSection).toBeInTheDocument();

    // Get all problem containers
    const problems = problemsSection?.querySelectorAll('.flex.items-center.gap-4.p-3.rounded-lg.border');
    expect(problems?.length).toBe(2);

    // First problem (correct)
    const firstProblem = problems?.[0];
    expect(firstProblem).toHaveClass('bg-green-50');
    // Check first problem expression parts
    const firstProblemExpression = firstProblem?.querySelector('.flex.items-center.gap-2.flex-1');
    expect(firstProblemExpression).toHaveTextContent('2');
    expect(firstProblemExpression).toHaveTextContent('×');
    expect(firstProblemExpression).toHaveTextContent('3');
    expect(firstProblemExpression).toHaveTextContent('=');
    expect(firstProblemExpression).toHaveTextContent('6');
    expect(firstProblem).toHaveTextContent('2.0s');
    
    // Second problem (incorrect)
    const secondProblem = problems?.[1];
    expect(secondProblem).toHaveClass('bg-red-50');
    const secondProblemExpression = secondProblem?.querySelector('.flex.items-center.gap-2.flex-1');
    expect(secondProblemExpression).toHaveTextContent('4');
    expect(secondProblemExpression).toHaveTextContent('×');
    expect(secondProblemExpression).toHaveTextContent('5');
    expect(secondProblemExpression).toHaveTextContent('=');
    expect(secondProblemExpression).toHaveTextContent('25');
    expect(secondProblemExpression).toHaveTextContent('should be 20');
  });

  it('renders the multiplication grid', () => {
    render(<SessionSummary summary={mockSummary} />);
    
    // Check grid headers
    for (let i = 2; i <= 10; i++) {
      // Each number appears twice - once in row headers, once in column headers
      // Get all elements with this number in the grid headers
      const elements = screen.getAllByText(i.toString()).filter(el => 
        el.closest('.bg-gray-50')
      );
      expect(elements).toHaveLength(2);
    }
  });

  it('renders explanatory text', () => {
    render(<SessionSummary summary={mockSummary} />);
    
    // Find the explanatory text
    expect(screen.getByText(/Green indicates mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/gray is neutral/i)).toBeInTheDocument();
    expect(screen.getByText(/red indicates need for more practice/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SessionSummary summary={mockSummary} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
