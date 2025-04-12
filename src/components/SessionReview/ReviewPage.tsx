// src/components/SessionReview/ReviewPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelector from './UserSelector';
import SessionList from './SessionList';
import PerformanceSummary from './PerformanceSummary';
import ProblemTypeSelector from './ProblemTypeSelector';
import { api, ProblemType } from '../../services/api';

// Same storage key as in LandingPage for consistency
const LAST_SELECTED_USER_KEY = 'math-practice-last-user';
const LAST_SELECTED_PROBLEM_TYPE_KEY = 'math-practice-review-problem-type';

// User interface
interface User {
  id: number;
  name: string;
  is_parent: boolean;
}

// Session interface with proper problem type definition
interface SessionInterface {
  id: number;
  date: string;
  totalProblems: number;
  correctProblems: number;
  accuracy: number;
  averageResponseTime: number;
  problemType?: ProblemType; // Now optional as it might come from response top-level
  missedProblems: Array<{
    factor1: number;
    factor2: number;
    userAnswer: number;
    correctAnswer: number;
    responseTime: number;
    problemType?: ProblemType;
    missingOperandPosition?: string;
  }>;
}

// Problem interface
interface Problem {
  factor1: number;
  factor2: number;
  accuracy: number;
  averageResponseTime: number;
  attempts: number;
  problemType?: ProblemType;
}

// Session review data interface based on API schema
interface ReviewData {
  problemType?: ProblemType; // Added this field for the top-level problemType in response
  summary: {
    totalSessions: number;
    totalProblems: number;
    overallAccuracy: number;
    averageResponseTime: number;
    trends: {
      sessions: string[];
      accuracy: number[];
      responseTime: number[];
      problemTypes?: {
        [key in ProblemType]?: {
          accuracy: number[];
          responseTime: number[];
        };
      };
    };
    challengingProblems: Problem[];
    slowestProblems: Problem[];
    problemTypeStats?: {
      [key in ProblemType]?: {
        totalProblems: number;
        correctProblems: number;
        accuracy: number;
        averageResponseTime: number;
      };
    };
  };
  sessions: SessionInterface[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSessions: number;
  };
}

// Number of sessions to load per page - reduced from 10 to improve display
const SESSIONS_PER_PAGE = 5;

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for data management
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType>(ProblemType.MULTIPLICATION);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Add state for users
  const [users, setUsers] = useState<User[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved problem type from localStorage
  useEffect(() => {
    const savedProblemType = localStorage.getItem(LAST_SELECTED_PROBLEM_TYPE_KEY);
    if (savedProblemType === ProblemType.MISSING_FACTOR) {
      setSelectedProblemType(ProblemType.MISSING_FACTOR);
    }
  }, []);

  // Fetch users only once on component mount
  useEffect(() => {
    const initializeReviewPage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch users first
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
        
        // Get previously selected user from localStorage
        const lastUserId = localStorage.getItem(LAST_SELECTED_USER_KEY);
        let parsedId: number | null = null;
        
        if (lastUserId) {
          parsedId = parseInt(lastUserId);
          // Verify the user exists in our list
          if (isNaN(parsedId) || !fetchedUsers.some(user => user.id === parsedId)) {
            parsedId = fetchedUsers.length > 0 ? fetchedUsers[0].id : null;
          }
        } else if (fetchedUsers.length > 0) {
          // If no stored user, default to first user
          parsedId = fetchedUsers[0].id;
        }
        
        // Set the selected user
        if (parsedId !== null) {
          setSelectedUserId(parsedId);
          
          // Fetch session data for the selected user with the problem type
          // Using the reduced SESSIONS_PER_PAGE value instead of hardcoded 10
          const data = await api.getUserSessions(parsedId, currentPage, SESSIONS_PER_PAGE, selectedProblemType);
          setReviewData(data);
        }
      } catch (err) {
        console.error('Error initializing review page:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeReviewPage();
  }, []); // Don't include selectedProblemType to avoid refetching on mount

  // Handle user selection change
  const handleUserChange = async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedUserId(userId);
      
      // Update localStorage with the new selection
      localStorage.setItem(LAST_SELECTED_USER_KEY, userId.toString());
      
      // Fetch session data for the selected user with problem type
      // Using the reduced SESSIONS_PER_PAGE value
      const data = await api.getUserSessions(userId, 1, SESSIONS_PER_PAGE, selectedProblemType);
      setReviewData(data);
      setCurrentPage(1); // Reset to first page when changing user
    } catch (err) {
      console.error('Error fetching user sessions:', err);
      setError('Failed to load user sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle problem type change
  const handleProblemTypeChange = async (problemType: ProblemType) => {
    if (selectedProblemType === problemType) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSelectedProblemType(problemType);
      
      // Save the selected problem type to localStorage
      localStorage.setItem(LAST_SELECTED_PROBLEM_TYPE_KEY, problemType);
      
      // Only fetch data if a user is selected
      if (selectedUserId) {
        // Now pass the problemType directly to the API call
        // Using the reduced SESSIONS_PER_PAGE value
        const data = await api.getUserSessions(selectedUserId, 1, SESSIONS_PER_PAGE, problemType);
        setReviewData(data);
        setCurrentPage(1); // Reset to first page when changing problem type
      }
    } catch (err) {
      console.error('Error fetching data for problem type:', err);
      setError('Failed to load data for the selected problem type.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (page: number) => {
    if (selectedUserId) {
      try {
        setIsLoading(true);
        // Include the problemType when fetching a new page
        // Using the reduced SESSIONS_PER_PAGE value
        const data = await api.getUserSessions(selectedUserId, page, SESSIONS_PER_PAGE, selectedProblemType);
        setReviewData(data);
        setCurrentPage(page);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Failed to load page data. Please try again.');
        setIsLoading(false);
      }
    }
  };

  // Navigate back to home page
  const handleClose = () => {
    navigate('/');
  };


  // Determine actual problem type from either selected type or response
  const actualProblemType = reviewData?.problemType || selectedProblemType;

  return (
    <div className="container mx-auto p-4 max-w-6xl w-full overflow-hidden">
      {/* Header with title, user selector and close button */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Session Review</h1>
          <div>
            <UserSelector 
              selectedUserId={selectedUserId}
              onUserChange={handleUserChange}
              users={users}
              isLoading={isLoading}
            />
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 mt-2 sm:mt-0"
          aria-label="Close review"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Problem Type Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Problem Type:</span>
            <ProblemTypeSelector
              selectedType={selectedProblemType}
              onTypeChange={handleProblemTypeChange}
            />
          </div>
          

        </div>
      </div>

      {/* Global error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main content - Two-column layout for iPad and desktop, single column for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Left column: Performance Summary */}
        <div className="w-full min-w-0 overflow-hidden">
          <PerformanceSummary 
            data={reviewData?.summary || null}
            isLoading={isLoading}
            error={error}
            selectedUserId={selectedUserId}
            problemType={actualProblemType}
          />
        </div>

        {/* Right column: Session List */}
        <div className="w-full min-w-0 overflow-hidden">
          <SessionList
            sessions={reviewData?.sessions || null}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={reviewData?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            onViewSession={sessionId => navigate(`/session/${sessionId}`)}
            problemType={actualProblemType}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;