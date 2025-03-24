import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunityById } from '../services/communityService';

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
  const navigate = useNavigate();

  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>(null);

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

  return { community };
};

export default useViewCommunityPage;
