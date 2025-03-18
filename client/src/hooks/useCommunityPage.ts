import { useEffect, useState } from 'react';
import {
  getCommunities,
  getCommunitiesByUser,
  joinCommunity,
  leaveCommunity,
} from '../services/communityService';
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
  const [viewJoined, setViewJoined] = useState<boolean>(true);
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

  const handleLeaveCommunity = async (title: string) => {
    if (!viewJoined) {
      leaveCommunity(title, currentUser.username).then(
        () =>
          getCommunitiesByUser(currentUser.username).then(communities =>
            setCommunityList(communities),
          ),
        () => {
          console.log("can't leave community");
        },
      );
    } else {
      leaveCommunity(title, currentUser.username).then(
        () => getCommunities().then(communities => setCommunityList(communities)),
        () => {
          console.log("can't leave community");
        },
      );
    }
  };

  const isUserInCommunity = (title: string): boolean => {
    const community = communityList.find(c => c.title === title);
    return community ? community.members.includes(currentUser._id) : false;
  };

  const toggleCommunityView = async () => {
    if (viewJoined) {
      setTitleText('My Communities');
      setCommunityList(await getCommunitiesByUser(currentUser.username));
    } else {
      setTitleText('All Communities');
      setCommunityList(await getCommunities());
    }
    setViewJoined(!viewJoined);
  };

  return {
    titleText,
    communityList,
    handleJoinCommunity,
    handleLeaveCommunity,
    isUserInCommunity,
    toggleCommunityView,
  };
};

export default useCommunityPage;
