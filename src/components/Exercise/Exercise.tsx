// src/components/Exercise/Exercise.tsx - Updated with IncorrectAnswerView
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, SessionSummary as SessionSummaryType, ProblemType } from '../../services/api';
import ExerciseView from './ExerciseView';
import IncorrectAnswerView from './IncorrectAnswerView';
import CompletionMessage from './CompletionMessage';
import SessionSummary from '../SessionSummary/SessionSummary';
import LoadingView from './LoadingView';
import ErrorView from './ErrorView';
import EncouragementMessage from './EncouragementMessage';
import useEncouragementMessages from './hooks/useEncouragementMessage';

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
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [problemType, setProblemType] = useState<ProblemType>(ProblemType.MULTIPLICATION);
  
  // New state variables for incorrect answer view
  const [showIncorrectView, setShowIncorrectView] = useState(false);
  const [lastIncorrectProblem, setLastIncorrectProblem] = useState<Problem | null>(null);
  const [lastIncorrectAnswer, setLastIncorrectAnswer] = useState('');

  const { 
    setStartTime, 
    isPaused,
    togglePause, 
    calculateResponseTime, 
    resetTimer 
  } = useExerciseTimer();

  // Initialize the encouragement messages hook
  const {
    message,
    isVisible,
    hideMessage,
    processEncouragementData
  } = useEncouragementMessages();

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
        setProblemType(session.problem_type);
        
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
          
          // Handle the type mismatch between api.Problem and Exercise.Problem
          setCurrentProblem({
            problemId: problem.problemId,
            factor1: problem.factor1,
            factor2: problem.factor2,
            missingOperandPosition: problem.missingOperandPosition,
            product: problem.product
          });
          
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

  const handleNext = async () => {
    if (!currentProblem || !sessionId || isPaused || isProcessingAnswer) return;
  
    // Start the processing state - will disable input during encouragement display
    setIsProcessingAnswer(true);
    const responseTimeMs = calculateResponseTime();
    
    try {
      // Convert the user's answer to a number
      const answerNum = parseInt(currentAnswer);
      
      const result = await api.submitAttempt(
        parseInt(sessionId),
        currentProblem.problemId,
        answerNum,
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
      } else {
        // Store information about the incorrect answer for display
        setLastIncorrectProblem(currentProblem);
        setLastIncorrectAnswer(currentAnswer);
        setShowIncorrectView(true);
        setIsProcessingAnswer(false);
        return; // Exit early to show incorrect view
      }
  
      // Handle session completion
      if (result.isSessionComplete && result.sessionSummary) {
        // Show completion message briefly before showing full summary
        setShowCompletionMessage(true);
        setIsComplete(true);
        setSessionSummary(result.sessionSummary);
        
        // After 2 seconds, hide the completion message to show the full summary
        setTimeout(() => {
          setShowCompletionMessage(false);
        }, 2000);
        return; // Exit early for completed sessions
      }
  
      // Process encouragement data if available
      const shouldShowEncouragement = result.encouragementData && result.isCorrect;
      if (shouldShowEncouragement && result.encouragementData) {
        processEncouragementData(result.encouragementData);
        
        // For encouragement messages, set a shorter delay (700ms instead of 1000ms)
        setTimeout(async () => {
          try {
            const nextProblem = await api.getNextProblem(parseInt(sessionId));
            
            // Here we need to explicitly handle the type compatibility
            setCurrentProblem({
              problemId: nextProblem.problemId,
              factor1: nextProblem.factor1,
              factor2: nextProblem.factor2,
              missingOperandPosition: nextProblem.missingOperandPosition,
              product: nextProblem.product
            });
            setCurrentAnswer('0');
            resetTimer();
            setIsProcessingAnswer(false);
          } catch (err) {
            console.error('Error fetching next problem:', err);
            setError('Failed to load the next problem. Please try again.');
            setIsProcessingAnswer(false);
          }
        }, 700); // Reduced from 1000ms to 700ms for a more responsive feel
      } else {
        // If no encouragement message, fetch next problem immediately with no delay
        try {
          const nextProblem = await api.getNextProblem(parseInt(sessionId));
          
          // Here we need to explicitly handle the type compatibility
          setCurrentProblem({
            problemId: nextProblem.problemId,
            factor1: nextProblem.factor1,
            factor2: nextProblem.factor2,
            missingOperandPosition: nextProblem.missingOperandPosition,
            product: nextProblem.product
          });
          setCurrentAnswer('0');
          resetTimer();
          setIsProcessingAnswer(false);
        } catch (err) {
          console.error('Error fetching next problem:', err);
          setError('Failed to load the next problem. Please try again.');
          setIsProcessingAnswer(false);
        }
      }
    } catch (err) {
      console.error('Error submitting attempt:', err);
      setError('Failed to submit answer. Please try again.');
      setIsProcessingAnswer(false);
    }
  };

  // New handler for continuing after incorrect answer view
  const handleContinueAfterIncorrect = async () => {
    setShowIncorrectView(false);
    setIsProcessingAnswer(true);
    
    try {
      if (!sessionId) {
        throw new Error('No session ID available');
      }
      
      const sessionIdNum = parseInt(sessionId);
      
      // First check if the session is already complete
      const session = await api.getSession(sessionIdNum);
      
      if (session.is_completed) {
        // Session is complete, show the summary instead of getting next problem
        const attempts = await api.getSessionAttempts(sessionIdNum);
        const correctOnes = attempts.filter(a => a.isCorrect).length;
        setCorrectCount(correctOnes);
        
        const summary = await api.getSessionSummary(sessionIdNum);
        setSessionSummary(summary);
        setIsComplete(true);
        setShowCompletionMessage(true);
        
        // After 2 seconds, hide the completion message to show the full summary
        setTimeout(() => {
          setShowCompletionMessage(false);
        }, 2000);
        
        setIsProcessingAnswer(false);
        return;
      }
      
      // If session not complete, get the next problem
      const nextProblem = await api.getNextProblem(sessionIdNum);
      
      setCurrentProblem({
        problemId: nextProblem.problemId,
        factor1: nextProblem.factor1,
        factor2: nextProblem.factor2,
        missingOperandPosition: nextProblem.missingOperandPosition,
        product: nextProblem.product
      });
      setCurrentAnswer('0');
      resetTimer();
      setIsProcessingAnswer(false);
    } catch (err) {
      console.error('Error fetching next problem after incorrect answer:', err);
      
      // Check if this is a "Session is already completed" error
      if (err instanceof Error && err.message.includes('completed')) {
        try {
          if (!sessionId) {
            throw new Error('No session ID available');
          }
          
          const sessionIdNum = parseInt(sessionId);
          
          // Try to get the session summary for the completed session
          const attempts = await api.getSessionAttempts(sessionIdNum);
          const correctOnes = attempts.filter(a => a.isCorrect).length;
          setCorrectCount(correctOnes);
          
          const summary = await api.getSessionSummary(sessionIdNum);
          setSessionSummary(summary);
          setIsComplete(true);
          setShowCompletionMessage(true);
          
          setTimeout(() => {
            setShowCompletionMessage(false);
          }, 2000);
        } catch (summaryErr) {
          console.error('Error fetching session summary:', summaryErr);
          setError('Unable to load the session results. Please return to home and try again.');
        }
      } else {
        setError('Failed to load the next problem. Please try again.');
      }
      
      setIsProcessingAnswer(false);
    }
  };

  // Handle encouragement message complete
  const handleMessageComplete = () => {
    hideMessage();
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

  // Show the incorrect answer view when needed
  if (showIncorrectView && lastIncorrectProblem) {
    // Calculate the correct answer based on problem type
    let correctAnswer: number;
    
    if (problemType === ProblemType.MISSING_FACTOR) {
      // For missing factor problems, the correct answer is the missing factor
      // We need to check which position is missing and use that value
      if (lastIncorrectProblem.missingOperandPosition === 'first') {
        // If first position is missing, we need the value that, when multiplied by factor2, gives product
        const factor2 = lastIncorrectProblem.factor2 !== null ? lastIncorrectProblem.factor2 : 1;
        const product = lastIncorrectProblem.product !== undefined ? lastIncorrectProblem.product : 0;
        correctAnswer = factor2 !== 0 ? product / factor2 : 0;
      } else {
        // If second position is missing, we need the value that, when multiplied by factor1, gives product
        const factor1 = lastIncorrectProblem.factor1 !== null ? lastIncorrectProblem.factor1 : 1;
        const product = lastIncorrectProblem.product !== undefined ? lastIncorrectProblem.product : 0;
        correctAnswer = factor1 !== 0 ? product / factor1 : 0;
      }
    } else {
      // Handle regular multiplication problems
      const factor1 = lastIncorrectProblem.factor1 !== null ? lastIncorrectProblem.factor1 : 0;
      const factor2 = lastIncorrectProblem.factor2 !== null ? lastIncorrectProblem.factor2 : 0;
      correctAnswer = factor1 * factor2;
    }
    
    return (
      <div className="flex justify-center items-center h-screen">
        <IncorrectAnswerView
          problem={{
            ...lastIncorrectProblem,
            missingOperandPosition: lastIncorrectProblem.missingOperandPosition || 'second'
          }}
          userAnswer={lastIncorrectAnswer}
          correctAnswer={correctAnswer}
          onContinue={handleContinueAfterIncorrect}
          problemType={problemType}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <ExerciseView
        currentProblem={currentProblem}
        currentAnswer={currentAnswer}
        setCurrentAnswer={setCurrentAnswer}
        results={results}
        totalProblems={totalProblems}
        isPaused={isPaused}
        togglePause={togglePause}
        handleNext={handleNext}
        isInteractionDisabled={isProcessingAnswer}
        problemType={problemType}
      />
      
      {/* Encouragement message */}
      {message && (
        <EncouragementMessage 
          message={message} 
          isVisible={isVisible} 
          onAnimationComplete={handleMessageComplete} 
        />
      )}
    </div>
  );
};

export default Exercise;