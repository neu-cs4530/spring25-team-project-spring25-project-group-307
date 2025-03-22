import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PopulatedDatabaseCommunity, SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { getCommunityById } from '../services/communityService';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing the answer page's state, navigation, and real-time updates.
 *
 * @returns questionID - The current question ID retrieved from the URL parameters.
 * @returns question - The current question object with its answers, comments, and votes.
 * @returns handleNewComment - Function to handle the submission of a new comment to a question or answer.
 * @returns handleNewAnswer - Function to navigate to the "New Answer" page
 */
const useViewCommunityPage = () => {
  const { cid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('None');

  useEffect(() => {
    if (!cid) {
      navigate('/home');
      return;
    }

    const fetchCommunity = async () => {
      try {
        const res = await getCommunityById(cid);
        setCommunity(res || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    fetchCommunity();
  }, [cid, navigate]);

  useEffect(() => {
    const setCurrentUserRole = () => {
      if (community) {
        if (community.admins.some(admin => admin._id === user?._id)) {
          setCurrentRole('ADMIN');
        } else if (community.moderators.some(moderator => moderator._id === user?._id)) {
          setCurrentRole('MODERATOR');
        } else {
          setCurrentRole('MEMBER');
        }
      }
    };

    setCurrentUserRole();
  }, [community, user, currentRole]);

  return { community, currentRole };
};

export default useViewCommunityPage;
