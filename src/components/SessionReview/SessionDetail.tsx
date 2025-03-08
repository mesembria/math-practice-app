// src/components/SessionReview/SessionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, SessionSummary } from '../../services/api';

/**
 * SessionDetail component for viewing detailed session results
 */
const SessionDetail: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!sessionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const summary = await api.getSessionSummary(parseInt(sessionId));
        setSessionSummary(summary);
      } catch (err) {
        console.error('Error fetching session summary:', err);
        setError('Failed to load session details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionSummary();
  }, [sessionId]);

  const handleBack = () => {
    navigate('/review');
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex flex-col items-center gap-4 my-8">
          <div className="w-16 h-16 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header with title and back button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L6.414 9H17a1 1 0 110 2H6.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Review
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Session Details</h1>
      </div>

      {/* If we have a session summary, use the existing SessionSummary component */}
      {sessionSummary ? (
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* This is where we would import and use the existing SessionSummary component */}
          <p className="mb-4">Session ID: {sessionId}</p>
          <p className="mb-4">Session date: {new Date(sessionSummary.sessionStats.completedAt).toLocaleString()}</p>
          <p className="mb-4">
            Session accuracy: {sessionSummary.sessionStats.accuracy.toFixed(1)}% 
            ({sessionSummary.sessionStats.correctAnswers} of {sessionSummary.sessionStats.totalProblems} correct)
          </p>
          
          {/* Message indicating the full integration */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Note: In the full implementation, this page would use the existing SessionSummary component 
              to display detailed performance metrics and a list of all problems that were attempted during the session.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-gray-600">No session data available</p>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;