// src/components/Exercise/Exercise.tsx - Updated
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, SessionSummary as SessionSummaryType } from '../../services/api';
import ExerciseView from './ExerciseView';
import CompletionMessage from './CompletionMessage';
import SessionSummary from '../SessionSummary/SessionSummary';
import LoadingView from './LoadingView';
import ErrorView from './ErrorView';

import { Problem } from './types';
import { useExerciseTimer } from './hooks/useExercise';

/**
 * Container component that manages the state and data fetching for the exercise
 */
const Exercise: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('0');
  const [results, setResults] = useState<Array<boolean | null>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProblems, setTotalProblems] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const { 
    setStartTime, 
    isPaused,
    togglePause, 
    calculateResponseTime, 
    resetTimer 
  } = useExerciseTimer();

  // Fetch session and first problem on mount
  useEffect(() => {
    const fetchSessionAndProblem = async () => {
      try {
        if (!sessionId) {
          throw new Error('No session ID provided');
        }
        
        const parsedSessionId = parseInt(sessionId);
        
        // First get the session details
        const session = await api.getSession(parsedSessionId);
        setTotalProblems(session.total_problems);
        
        // Check if session is already completed
        if (session.is_completed) {
          // If completed, fetch the session results instead of the next problem
          try {
            // Get all attempts for this session to calculate correct count
            const attempts = await api.getSessionAttempts(parsedSessionId);
            const correctOnes = attempts.filter(a => a.isCorrect).length;
            setCorrectCount(correctOnes);
            
            // Get the full session summary
            const summary = await api.getSessionSummary(parsedSessionId);
            setSessionSummary(summary);
            setIsComplete(true);
            setIsLoading(false);
          } catch (summaryErr) {
            console.error('Error fetching completed session summary:', summaryErr);
            setError('Unable to load the session results. Please return to home and try again.');
            setIsLoading(false);
          }
          return;
        }
        
        // For active sessions, get the next problem
        try {
          const problem = await api.getNextProblem(parsedSessionId);
          setCurrentProblem(problem);
          setResults(new Array(session.total_problems).fill(null));
          setStartTime(Date.now());
          setIsLoading(false);
        } catch (problemErr) {
          console.error('Error fetching problem:', problemErr);
          setError('Failed to load exercise problems. Please try again.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load exercise session. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSessionAndProblem();
  }, [sessionId, setStartTime]);

  // Handle answer submission
  const handleNext = async () => {
    if (!currentProblem || !sessionId || isPaused) return;

    const responseTimeMs = calculateResponseTime();
    
    try {
      const result = await api.submitAttempt(
        parseInt(sessionId),
        currentProblem.problemId,
        parseInt(currentAnswer),
        responseTimeMs
      );

      // Update results at current index
      const newResults = [...results];
      const currentIndex = newResults.findIndex(r => r === null);
      if (currentIndex !== -1) {
        newResults[currentIndex] = result.isCorrect;
        setResults(newResults);
      }

      // Update correct count
      if (result.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }

      if (result.isSessionComplete && result.sessionSummary) {
        // Show completion message briefly before showing full summary
        setShowCompletionMessage(true);
        setIsComplete(true);
        setSessionSummary(result.sessionSummary);
        
        // After 2 seconds, hide the completion message to show the full summary
        setTimeout(() => {
          setShowCompletionMessage(false);
        }, 2000);
      } else {
        // Fetch next problem
        const nextProblem = await api.getNextProblem(parseInt(sessionId));
        setCurrentProblem(nextProblem);
        setCurrentAnswer('0');
        resetTimer();
      }
    } catch (err: unknown) {
      console.error('Error submitting attempt:', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  // Handle keyboard shortcuts for pause/resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  if (error) {
    return <ErrorView error={error} onReturnHome={() => navigate('/')} />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  if (isComplete) {
    if (showCompletionMessage) {
      return (
        <CompletionMessage 
          correctCount={correctCount} 
          totalProblems={totalProblems} 
        />
      );
    }

    if (sessionSummary) {
      return (
        <div className="flex flex-col max-w-[1200px] mx-auto p-2 pb-4">
          {/* Header row with title and button */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Exercise Results
            </h2>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start New Session
            </button>
          </div>
          
          {/* Session summary content */}
          <SessionSummary summary={sessionSummary} />
        </div>
      );
    }
  }

  if (!currentProblem) {
    return <ErrorView error="Problem data is missing" onReturnHome={() => navigate('/')} />;
  }

  return (
    <ExerciseView
      currentProblem={currentProblem}
      currentAnswer={currentAnswer}
      setCurrentAnswer={setCurrentAnswer}
      results={results}
      totalProblems={totalProblems}
      isPaused={isPaused}
      togglePause={togglePause}
      handleNext={handleNext}
    />
  );
};

export default Exercise;