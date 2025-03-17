import { useEffect, useState } from 'react';
import { getCommunities, joinCommunity } from '../services/communityService';
import { DatabaseCommunity } from '../types/types';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing the question page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the question page
 * @returns qlist - The list of questions to display
 * @returns setQuestionOrder - Function to set the sorting order of questions (e.g., newest, oldest).
 */
const useCommunityPage = () => {
  const [titleText, setTitleText] = useState<string>('All Communities');
  const [communityList, setCommunityList] = useState<DatabaseCommunity[]>([]);
  const { user: currentUser } = useUserContext();

  useEffect(() => {
    const pageTitle = 'All Communities';

    setTitleText(pageTitle);
  }, []);

  useEffect(() => {
    /**
     * Function to fetch questions based on the filter and update the question list.
     */
    const fetchData = async () => {
      try {
        const res = await getCommunities();
        setCommunityList(res || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleJoinCommunity = async (title: string) => {
    // TODO: in the future this should go view the comunity just joined

    joinCommunity(title, currentUser.username).then(
      () => getCommunities().then(communities => setCommunityList(communities)),
      () => {
        // TODO: in the future should display an error
        // eslint-disable-next-line no-console
        console.log("can't join community");
      },
    );
  };

  return { titleText, communityList, handleJoinCommunity };
};

export default useCommunityPage;
