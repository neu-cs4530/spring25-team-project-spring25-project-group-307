import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername } from '../services/userService';
import { SafeDatabaseUser } from '../types/types';
import { useRankUpNotifier } from '../components/notificaitonSettings/index';

const useStatistics = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
        setErrorMessage(null);
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
  };
};

export default useStatistics;
