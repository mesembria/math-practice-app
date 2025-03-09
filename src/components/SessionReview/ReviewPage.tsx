// src/components/SessionReview/ReviewPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelector from './UserSelector';
import SessionList from './SessionList';
import PerformanceSummary from './PerformanceSummary';
import { api } from '../../services/api';

// Same storage key as in LandingPage for consistency
const LAST_SELECTED_USER_KEY = 'math-practice-last-user';

// Session review data interface based on API schema
interface ReviewData {
  summary: {
    totalSessions: number;
    totalProblems: number;
    overallAccuracy: number;
    averageResponseTime: number;
    trends: {
      sessions: string[];
      accuracy: number[];
      responseTime: number[];
    };
    challengingProblems: Array<{
      factor1: number;
      factor2: number;
      accuracy: number;
      averageResponseTime: number;
      attempts: number;
    }>;
    slowestProblems: Array<{
      factor1: number;
      factor2: number;
      accuracy: number;
      averageResponseTime: number;
      attempts: number;
    }>;
  };
  sessions: Array<{
    id: number;
    date: string;
    totalProblems: number;
    correctProblems: number;
    accuracy: number;
    averageResponseTime: number;
    missedProblems: Array<{
      factor1: number;
      factor2: number;
      userAnswer: number;
      correctAnswer: number;
      responseTime: number;
    }>;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSessions: number;
  };
}

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for data management
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load the last selected user from localStorage on component mount
  useEffect(() => {
    const lastUserId = localStorage.getItem(LAST_SELECTED_USER_KEY);
    if (lastUserId) {
      const parsedId = parseInt(lastUserId);
      if (!isNaN(parsedId)) {
        setSelectedUserId(parsedId);
      }
    }
  }, []);

  // Fetch data when user or page changes
  useEffect(() => {
    if (selectedUserId) {
      setIsLoading(true);
      setError(null);
      
      // Fetch data
      api.getUserSessions(selectedUserId)
        .then(data => {
          setReviewData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user sessions:', err);
          setError('Failed to load user sessions. Please try again.');
          setIsLoading(false);
        });
    }
  }, [selectedUserId]);

  // Handle user selection change
  const handleUserChange = (userId: number) => {
    setSelectedUserId(userId);
    setCurrentPage(1); // Reset to first page when changing user
    
    // Update localStorage with the new selection
    localStorage.setItem(LAST_SELECTED_USER_KEY, userId.toString());
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Navigate back to home page
  const handleClose = () => {
    navigate('/');
  };

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
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;