import { useEffect, useState } from 'react';
import { getCommunities } from '../services/communityService';
import { DatabaseCommunity } from '../types/types';

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

  return { titleText, communityList };
};

export default useCommunityPage;
