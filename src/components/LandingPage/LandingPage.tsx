import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ProblemType } from '../../services/api';

// Storage keys for localStorage
const LAST_SELECTED_USER_KEY = 'math-practice-last-user';
const LAST_SELECTED_PROBLEM_TYPE_KEY = 'math-practice-last-problem-type';
const LAST_SELECTED_NUM_PROBLEMS_KEY = 'math-practice-last-num-problems';

// Type-safe localStorage helper functions
const safelyGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

const safelySetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

interface User {
  id: number;
  name: string;
  is_parent: boolean;
}

const LandingPage: React.FC = () => {
  // Flags to prevent double-saving
  const initialLoadDone = useRef(false);
  const blockSavingPreferences = useRef(true);
  
  // Preset values for number of problems
  const problemPresets: readonly number[] = [5, 10, 15, 20, 25] as const;
  
  // Initialize with default values first
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [numberOfProblems, setNumberOfProblems] = useState<number>(10);
  const [problemType, setProblemType] = useState<ProblemType>(ProblemType.MULTIPLICATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load ALL preferences at once in a single useEffect
  useEffect(() => {
    const loadAllPreferences = async (): Promise<void> => {
      console.log("Loading ALL preferences at once...");
      setIsLoading(true);
      
      // Step 1: Load the user list first
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
        
        // Step 2: Load all saved preferences from localStorage
        let savedUserId: number | null = null;
        let savedProblemType: ProblemType = ProblemType.MULTIPLICATION;
        let savedNumProblems: number = 10;
        
        // Load saved problem type
        const lastProblemTypeStr = safelyGetItem(LAST_SELECTED_PROBLEM_TYPE_KEY);
        console.log("Loaded problem type:", lastProblemTypeStr);
        if (lastProblemTypeStr === 'missing_factor') {
          savedProblemType = ProblemType.MISSING_FACTOR;
        }
        
        // Load saved number of problems
        const lastNumProblemsStr = safelyGetItem(LAST_SELECTED_NUM_PROBLEMS_KEY);
        console.log("Loaded problem count:", lastNumProblemsStr);
        if (lastNumProblemsStr) {
          const parsedNumProblems = parseInt(lastNumProblemsStr, 10);
          if (!isNaN(parsedNumProblems) && problemPresets.includes(parsedNumProblems)) {
            savedNumProblems = parsedNumProblems;
          }
        }
        
        // Load saved user ID (must be done after users are loaded)
        const lastUserIdStr = safelyGetItem(LAST_SELECTED_USER_KEY);
        console.log("Loaded user ID:", lastUserIdStr);
        if (lastUserIdStr) {
          const parsedId = parseInt(lastUserIdStr, 10);
          if (!isNaN(parsedId) && fetchedUsers.some(user => user.id === parsedId)) {
            savedUserId = parsedId;
          }
        }
        
        // Step 3: Set all state at once to minimize re-renders
        console.log("Setting ALL preferences at once:", {
          userId: savedUserId,
          problemType: savedProblemType,
          numProblems: savedNumProblems
        });
        
        // Update all state values at once
        setProblemType(savedProblemType);
        setNumberOfProblems(savedNumProblems);
        if (savedUserId !== null) {
          setSelectedUserId(savedUserId);
        }
        
        // Mark initial load as complete
        initialLoadDone.current = true;
        
        // After a short delay, allow saving preferences
        setTimeout(() => {
          blockSavingPreferences.current = false;
          console.log("Preferences saving is now enabled");
        }, 500);
        
      } catch (err: unknown) {
        console.error('Error loading preferences:', err);
        setError('Failed to load preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllPreferences();
  }, []); // Empty dependency array - run only once on mount

  // Save user selection to localStorage (after initial load)
  useEffect(() => {
    // Skip during initial render and loading phase
    if (!initialLoadDone.current || blockSavingPreferences.current || selectedUserId === null) {
      return;
    }
    
    console.log("Saving user ID:", selectedUserId);
    safelySetItem(LAST_SELECTED_USER_KEY, selectedUserId.toString());
  }, [selectedUserId]);

  // Save problem type to localStorage (after initial load)
  useEffect(() => {
    // Skip during initial render and loading phase
    if (!initialLoadDone.current || blockSavingPreferences.current) {
      return;
    }
    
    const problemTypeString: string = problemType === ProblemType.MULTIPLICATION 
      ? 'multiplication' 
      : 'missing_factor';
    console.log("Saving problem type:", problemTypeString);
    safelySetItem(LAST_SELECTED_PROBLEM_TYPE_KEY, problemTypeString);
  }, [problemType]);

  // Save number of problems to localStorage (after initial load)
  useEffect(() => {
    // Skip during initial render and loading phase
    if (!initialLoadDone.current || blockSavingPreferences.current) {
      return;
    }
    
    console.log("Saving number of problems:", numberOfProblems);
    safelySetItem(LAST_SELECTED_NUM_PROBLEMS_KEY, numberOfProblems.toString());
  }, [numberOfProblems]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      const session = await api.createSession(selectedUserId, numberOfProblems, problemType);
      navigate(`/exercise/${session.id}`);
    } catch (err: unknown) {
      console.error('Error creating session:', err);
      setError('Failed to start exercise session. Please try again.');
    }
  };

  const handleReviewClick = (): void => {
    navigate('/review');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xl text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header with Review button */}
      <div className="fixed top-0 right-0 p-4">
        <button
          onClick={handleReviewClick}
          className="bg-[#4285f4] text-white rounded-[15px] w-[80px] h-[30px] flex items-center justify-center text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors"
        >
          Review
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Math Practice
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Select User
            </label>
            <div className="grid grid-cols-2 gap-3">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`
                    p-3 rounded-lg text-center transition-all duration-200
                    ${selectedUserId === user.id
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }
                  `}
                >
                  <span className="font-medium">{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Problem Type Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Problem Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProblemType(ProblemType.MULTIPLICATION)}
                className={`
                  p-3 rounded-lg text-center transition-all duration-200
                  ${problemType === ProblemType.MULTIPLICATION
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }
                `}
              >
                <span className="font-medium">Multiplication</span>
              </button>
              <button
                type="button"
                onClick={() => setProblemType(ProblemType.MISSING_FACTOR)}
                className={`
                  p-3 rounded-lg text-center transition-all duration-200
                  ${problemType === ProblemType.MISSING_FACTOR
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }
                `}
              >
                <span className="font-medium">Missing Factor</span>
              </button>
            </div>
          </div>

          {/* Number of Problems Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Number of Problems
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {problemPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNumberOfProblems(preset)}
                  className={`
                    py-2 px-5 rounded-lg font-medium transition-all duration-200 min-w-16
                    ${numberOfProblems === preset
                      ? 'bg-green-500 text-white ring-2 ring-green-300 ring-offset-2'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            disabled={!selectedUserId}
            className={`
              w-full py-3 px-4 rounded-lg text-white text-lg font-medium 
              transition-colors duration-200
              ${!selectedUserId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            Start Practice
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;