import { ObjectId } from 'mongodb';
import { useState } from 'react';
import { addUserToCommunity, updateUserRole } from '../services/communityService';

interface UseCommunityUsersProps {
  communityID: ObjectId | undefined;
}

const useCommunityUsers = ({ communityID }: UseCommunityUsersProps) => {
  const [open, setOpen] = useState(false);
  const [userToAdd, setUserToAdd] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetUsername = (newUsername: string) => setUserToAdd(newUsername);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRoleChange = async (username: string, newRole: string) => {
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
    }
  };

  const handleAddUser = async () => {
    try {
      // Call the server to add the user to the community
      if (!communityID) {
        throw new Error('Community ID not provided');
      }

      // Add the user to the community
      const res = await addUserToCommunity(communityID, userToAdd);

      if (!res) {
        throw new Error('Failed to add user to community');
      }

      setUserToAdd('');
      handleClose();
    } catch (e) {
      setError('Failed to add user to community');
    }
  };

  return {
    error,
    handleRoleChange,
    handleAddUser,
    open,
    handleOpen,
    handleClose,
    userToAdd,
    handleSetUsername,
  };
};

export default useCommunityUsers;
