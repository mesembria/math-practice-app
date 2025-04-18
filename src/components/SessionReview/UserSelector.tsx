import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface User {
  id: number;
  name: string;
  is_parent: boolean;
}

interface UserSelectorProps {
  selectedUserId: number | null;
  onUserChange: (userId: number) => void;
  className?: string;
  users?: User[]; // Allow passing users from parent
  isLoading?: boolean; // Allow passing loading state
}

const UserSelector: React.FC<UserSelectorProps> = ({ 
  selectedUserId, 
  onUserChange,
  className = '',
  users: externalUsers, // Renamed to avoid name collision
  isLoading: externalLoading
}) => {
  const [internalUsers, setInternalUsers] = useState<User[]>([]);
  const [isInternalLoading, setIsInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use external users if provided, otherwise use internal state
  const users = externalUsers || internalUsers;
  const isLoading = externalLoading !== undefined ? externalLoading : isInternalLoading;

  // Only fetch users when component mounts if external users are not provided
  useEffect(() => {
    // Skip if external users are provided
    if (externalUsers) {
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setIsInternalLoading(true);
        const fetchedUsers = await api.getUsers();
        setInternalUsers(fetchedUsers);
        
        // If we have a selectedUserId but it's not in the user list, clear selection
        if (selectedUserId && !fetchedUsers.some(user => user.id === selectedUserId)) {
          onUserChange(fetchedUsers[0]?.id || 0);
        } else if (!selectedUserId && fetchedUsers.length > 0) {
          // If no user is selected and we have users, select the first one
          onUserChange(fetchedUsers[0].id);
        }
        
        setIsInternalLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setIsInternalLoading(false);
      }
    };

    fetchUsers();
  }, []); // Only run once on mount, remove dependencies that cause re-fetching

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(e.target.value);
    if (!isNaN(userId)) {
      onUserChange(userId);
    }
  };

  return (
    <div className={`w-[150px] ${className}`}>
      <div className="relative">
        <select
          id="user-select"
          className="w-full min-h-[30px] appearance-none rounded-md border border-gray-300 px-2 py-1 
                     bg-white text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     cursor-pointer"
          value={selectedUserId || ''}
          onChange={handleChange}
          disabled={isLoading}
          aria-label="Select user"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default UserSelector;