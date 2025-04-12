// src/components/SessionReview/SessionList.tsx
import React from 'react';
import { ProblemType } from '../../services/api';

// Define the session data interface based on the API schema
interface Session {
  id: number;
  date: string; // ISO date format
  totalProblems: number;
  correctProblems: number;
  accuracy: number; // percentage
  averageResponseTime: number;
  missedProblems: Array<{
    factor1: number;
    factor2: number;
    userAnswer: number;
    correctAnswer: number;
    responseTime: number;
    problemType?: ProblemType;
  }>;
  problemType?: ProblemType;
}

interface SessionListProps {
  sessions: Session[] | null;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewSession: (sessionId: number) => void;
  problemType: ProblemType;
}

/**
 * SessionList component displays a list of practice sessions with pagination
 * Uses a more compact layout with primary data on one line
 */
const SessionList: React.FC<SessionListProps> = ({
  sessions,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewSession,
  problemType
}) => {
  // Format date string to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get problem type label
  const problemTypeLabel = problemType === ProblemType.MULTIPLICATION 
    ? 'Multiplication' 
    : 'Missing Factor';


  return (
    <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
      <h2 className="text-xl font-semibold p-3 border-b">{problemTypeLabel} Sessions</h2>
      
      {/* Loading State */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading {problemTypeLabel.toLowerCase()} sessions...</p>
        </div>
      )}
      
      {/* No Data State */}
      {!isLoading && (!sessions || sessions.length === 0) && (
        <div className="p-8 text-center text-gray-600">
          No {problemTypeLabel.toLowerCase()} session history found for this user
        </div>
      )}
      
      {/* Sessions List */}
      {!isLoading && sessions && sessions.length > 0 && (
        <div className="space-y-2 mb-4 p-2">
          {sessions.map((session) => {
            // Filter missed problems to only show those matching the current problem type
            const relevantMissedProblems = session.missedProblems;
            
            return (
              <div 
                key={session.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => onViewSession(session.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    {/* Primary info - all on one line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium text-gray-800">{formatDate(session.date)}</span>
                      <span className="text-gray-600">{session.totalProblems} problems</span>
                      <span className="text-gray-600">{session.accuracy.toFixed(1)}% correct</span>
                      <span className="text-gray-600">{(session.averageResponseTime / 1000).toFixed(1)}s avg</span>
                    </div>
                    
                    {/* Missed problems - only displayed if there are any */}
                    {relevantMissedProblems.length > 0 && (
                      <div className="text-sm text-red-500 mt-1 text-left">
                        Missed: {relevantMissedProblems.map(p => {
                          // Format display based on problem type
                          if (problemType === ProblemType.MISSING_FACTOR) {
                            // For missing factor, show product
                            const product = p.factor1 * p.factor2;
                            // Randomly choose between the two formats for variety
                            return Math.random() > 0.5 
                              ? `${p.factor1}×?=${product}` 
                              : `?×${p.factor2}=${product}`;
                          }
                          return `${p.factor1}×${p.factor2}`;
                        }).slice(0, 5).join(', ')}
                        {relevantMissedProblems.length > 5 && ` and ${relevantMissedProblems.length - 5} more`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination Controls */}
      {!isLoading && sessions && sessions.length > 0 && totalPages > 1 && (
        <div className="flex justify-center p-4 border-t">
          <div className="flex space-x-1">
            {/* Previous Page Button */}
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages centered around current page for large page counts
              let pageNum = i + 1;
              if (totalPages > 5) {
                const startPage = Math.max(1, currentPage - 2);
                pageNum = startPage + i;
                // Don't show pages beyond totalPages
                if (pageNum > totalPages) return null;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => onPageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Next Page Button */}
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;