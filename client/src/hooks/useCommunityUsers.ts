import { ObjectId } from 'mongodb';
import { useState } from 'react';
import { updateUserRole } from '../services/communityService';

interface UseCommunityUsersProps {
  communityID: ObjectId | undefined;
}

const useCommunityUsers = ({ communityID }: UseCommunityUsersProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (username: string, newRole: string) => {
    setLoading(true);
    setError(null);

    try {
      // Call the server to update the user's role
      if (!communityID) {
        throw new Error('Community ID not provided');
      }

      const res = await updateUserRole(communityID, username, newRole);

      if (!res) {
        throw new Error('Failed to update user role');
      }
    } catch (e) {
      setError('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleRoleChange };
};

export default useCommunityUsers;
