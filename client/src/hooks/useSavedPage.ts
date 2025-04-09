import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import { useState, useEffect } from 'react';
import { getUserWithSavedQuestions, removeSavedQuestion } from '../services/userService';
import useUserContext from './useUserContext';

// Custom hook to handle logic for the User's Saved Questions page
const useSavedPage = () => {
  const { user } = useUserContext();

  // State to store the list of saved questions
  const [savedQuestions, setSavedQuestions] = useState<PopulatedDatabaseQuestion[]>([]);

  // State to control visibility of the share popup
  const [sharePopupOpen, setSharePopupOpen] = useState(false);

  // State to store the id of the question being shared
  const [sharePopupId, setSharePopupId] = useState('');

  // Fetches the user's saved questions whenever the user changes
  useEffect(() => {
    if (user?.username) {
      getUserWithSavedQuestions(user.username).then(userResponse =>
        setSavedQuestions(userResponse.savedQuestions),
      );
    }
  }, [user?.username]);

  // Removes a question from the saved list both locally and in the database
  const handleUnsave = async (questionId: ObjectId) => {
    // Optimistically update UI
    setSavedQuestions(prev => prev.filter(q => String(q._id) !== String(questionId)));

    // Update in database
    removeSavedQuestion(user.username, questionId);
  };

  // Opens the share popup for a specific question
  const handleShare = (questionId: ObjectId) => {
    setSharePopupId(String(questionId));
    setSharePopupOpen(true);
  };

  // Expose data & functions to consuming components
  return {
    savedQuestions,
    handleUnsave,
    handleShare,
    sharePopupOpen,
    setSharePopupOpen,
    sharePopupId,
  };
};

export default useSavedPage;
