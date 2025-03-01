import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Exercise from './Exercise';

// Create mock functions
const mockGetNextProblem = vi.fn();
const mockSubmitAttempt = vi.fn();

// Mock the API module
vi.mock('../../services/api', () => ({
  api: {
    getNextProblem: mockGetNextProblem,
    submitAttempt: mockSubmitAttempt,
  },
}));

describe('Exercise Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (sessionId: string = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/exercise/${sessionId}`]}>
        <Routes>
          <Route path="/exercise/:sessionId" element={<Exercise />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should display loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText(/loading problems/i)).toBeInTheDocument();
  });

  it('should fetch and display the first problem', async () => {
    mockGetNextProblem.mockResolvedValueOnce({
      problemId: 1,
      factor1: 2,
      factor2: 3,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('2 × 3 =')).toBeInTheDocument();
    });
  });

  it('should handle answer submission', async () => {
    mockGetNextProblem.mockResolvedValueOnce({
      problemId: 1,
      factor1: 2,
      factor2: 3,
    });

    mockSubmitAttempt.mockResolvedValueOnce({
      isCorrect: true,
      correctAnswer: 6,
      isSessionComplete: false,
    });

    mockGetNextProblem.mockResolvedValueOnce({
      problemId: 2,
      factor1: 4,
      factor2: 5,
    });

    renderWithRouter();

    // Wait for first problem to load
    await waitFor(() => {
      expect(screen.getByText('2 × 3 =')).toBeInTheDocument();
    });

    // Enter answer
    fireEvent.click(screen.getByText('6'));
    fireEvent.click(screen.getByLabelText('Next'));

    // Wait for next problem
    await waitFor(() => {
      expect(screen.getByText('4 × 5 =')).toBeInTheDocument();
    });
  });

  it('should show completion screen when session is complete', async () => {
    mockGetNextProblem.mockResolvedValueOnce({
      problemId: 1,
      factor1: 2,
      factor2: 3,
    });

    mockSubmitAttempt.mockResolvedValueOnce({
      isCorrect: true,
      correctAnswer: 6,
      isSessionComplete: true,
    });

    renderWithRouter();

    // Wait for problem to load
    await waitFor(() => {
      expect(screen.getByText('2 × 3 =')).toBeInTheDocument();
    });

    // Submit answer
    fireEvent.click(screen.getByText('6'));
    fireEvent.click(screen.getByLabelText('Next'));

    // Check for completion screen
    await waitFor(() => {
      expect(screen.getByText(/exercise complete/i)).toBeInTheDocument();
      expect(screen.getByText(/you got 1 out of 1 correct/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockGetNextProblem.mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/failed to load problem/i)).toBeInTheDocument();
    });
  });
});
