import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChipProps } from '@mui/material';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
} from '../services/userService';
import { DatabaseTag, Interest, SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';
import {
  getInterestsByUser,
  resetInterestsWeightsByUser,
  updateInterests,
} from '../services/interestService';
import { getAllTags, getTagsByIds } from '../services/tagService';
import { refresh } from '../services/feedService';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [populatedTags, setPopulatedTags] = useState<DatabaseTag[]>([]);
  const [allTags, setAllTags] = useState<DatabaseTag[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [editInterestsMode, setEditInterestsMode] = useState(false);
  const [newInterests, setNewInterests] = useState<Interest[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);

        // If the user has interests, fetch them
        const userInterests = await getInterestsByUser(data._id);
        if (userInterests.length > 0) {
          const tags = await getTagsByIds(userInterests.map(interest => interest.tagId));
          setPopulatedTags(tags);
          setNewInterests(userInterests);
        }

        // Fetch all tags from the database
        const allPopulatedTags = await getAllTags();
        setAllTags(allPopulatedTags);
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateInterests = async () => {
    if (!username) return;
    try {
      // Await the async call to update the interests
      await updateInterests(username, newInterests);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setEditInterestsMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      const newTags = await getTagsByIds(newInterests.map(interest => interest.tagId));
      setPopulatedTags(newTags);

      await refresh(currentUser._id);

      setSuccessMessage('Interests updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update interests.');
      setSuccessMessage(null);
    }
  };

  const handleResetInterestsWeights = async () => {
    if (!userData) return;
    try {
      await resetInterestsWeightsByUser(userData._id);
      setSuccessMessage('Interests weights reset!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to reset interests weights.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  const getTagColor = (tag: DatabaseTag): ChipProps['color'] => {
    const matchingInterest = newInterests.find(
      interest => interest.userId === currentUser._id && interest.tagId === tag._id,
    );
    let color: ChipProps['color'] = 'default';
    if (matchingInterest) {
      color = matchingInterest.priority === 'high' ? 'secondary' : 'primary';
    }
    return color;
  };

  return {
    userData,
    populatedTags,
    allTags,
    getTagColor,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    setEditBioMode,
    newBio,
    setNewBio,
    editInterestsMode,
    setEditInterestsMode,
    newInterests,
    setNewInterests,
    successMessage,
    errorMessage,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleUpdateInterests,
    handleDeleteUser,
    handleResetInterestsWeights,
  };
};

export default useProfileSettings;
