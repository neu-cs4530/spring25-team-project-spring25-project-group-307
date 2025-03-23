import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername, getUserStatistics } from '../services/userService';
import { SafeDatabaseUser } from '../types/types';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useStatistics = () => {
  const { username } = useParams<{ username: string }>();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User statistics state
  const [questionsAsked, setQuestionsAsked] = useState<number>(0);
  const [responsesGiven, setResponsesGiven] = useState<number>(0);

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return {
    userData,
    errorMessage,
    loading,
    questionsAsked,
    responsesGiven,
  };
};

export default useStatistics;
