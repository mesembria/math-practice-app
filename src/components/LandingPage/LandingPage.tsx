import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface User {
  id: number;
  name: string;
  is_parent: boolean;
}

const LandingPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [numberOfProblems, setNumberOfProblems] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Preset values for number of problems
  const problemPresets = [5, 10, 15, 20, 25];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      const session = await api.createSession(selectedUserId, numberOfProblems);
      navigate(`/exercise/${session.id}`);
    } catch (err: unknown) {
      console.error('Error creating session:', err);
      setError('Failed to start exercise session. Please try again.');
    }
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