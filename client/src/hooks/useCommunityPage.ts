import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ObjectId } from 'mongodb';
import {
  getCommunities,
  getCommunitiesByUser,
  joinCommunity,
  leaveCommunity,
  getCommunitiesBySearch,
  getTagsByCommunity,
  getAllCommunityTags,
  getCommunitiesByTags,
} from '../services/communityService';
import { DatabaseCommunity, DatabaseTag } from '../types/types';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing the question page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the question page
 * @returns qlist - The list of questions to display
 * @returns setQuestionOrder - Function to set the sorting order of questions (e.g., newest, oldest).
 */
const useCommunityPage = () => {
  const [val, setVal] = useState<string>('');
  const [titleText, setTitleText] = useState<string>('All Communities');
  const [communityList, setCommunityList] = useState<DatabaseCommunity[]>([]);
  const [viewJoined, setViewJoined] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [communityTags, setCommunityTags] = useState<Record<string, DatabaseTag[]>>({}); // Map of community ID to tags
  const [tagFilterList, setTagFilterList] = useState<DatabaseTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user: currentUser } = useUserContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let pageTitle = 'All Communities';
    let searchString = '';

    const searchQuery = searchParams.get('search');

    if (searchQuery) {
      pageTitle = 'Search Results';
      searchString = searchQuery;
    }

    setTitleText(pageTitle);
    setSearch(searchString);
  }, [searchParams]);

  useEffect(() => {
    /**
     * Function to fetch questions based on the filter and update the question list.
     */
    const fetchData = async () => {
      try {
        if (selectedTags.length > 0) {
          const res = await getCommunitiesByTags(selectedTags);
          setCommunityList(res || []);
        }
        // if no search query, fetch all communities
        else if (search === '') {
          const res = await getCommunities();
          setCommunityList(res || []);
        }
        // if there is a search query, fetch communities with that query
        else {
          const res = await getCommunitiesBySearch(search);
          setCommunityList(res || []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    fetchData();
  }, [search, selectedTags]);

  useEffect(() => {
    const fetchTags = async () => {
      const tagsMap: Record<string, DatabaseTag[]> = {};

      // Create an array of promises for fetching tags
      const tagPromises = communityList.map(async community => {
        const tags = await getTagsByCommunity(community._id); // Fetch tags for each community
        tagsMap[community._id.toString()] = tags || [];
      });

      // Wait for all promises to resolve
      await Promise.all(tagPromises);

      // Update the state with the fetched tags
      setCommunityTags(tagsMap);
    };

    const fetchTagFilterList = async () => {
      const tags = await getAllCommunityTags();
      setTagFilterList(tags || []);
    };

    fetchTags();
    fetchTagFilterList();
  }, [communityList]);

  const handleJoinCommunity = async (event: React.MouseEvent, title: string) => {
    // TODO: in the future this should go view the comunity just joined
    event.stopPropagation();

    joinCommunity(title, currentUser.username).then(
      () => getCommunities().then(communities => setCommunityList(communities)),
      () => {
        // TODO: in the future should display an error
        // eslint-disable-next-line no-console
        console.log("can't join community");
      },
    );
  };

  const handleLeaveCommunity = async (event: React.MouseEvent, title: string) => {
    event.stopPropagation();
    if (!viewJoined) {
      leaveCommunity(title, currentUser.username).then(
        () =>
          getCommunitiesByUser(currentUser.username).then(communities =>
            setCommunityList(communities),
          ),
        () => {
          // eslint-disable-next-line no-console
          console.log("can't leave community");
        },
      );
    } else {
      leaveCommunity(title, currentUser.username).then(
        () => getCommunities().then(communities => setCommunityList(communities)),
        () => {
          // eslint-disable-next-line no-console
          console.log("can't leave community");
        },
      );
    }
  };

  const handleViewCommunity = (event: React.MouseEvent, cid: ObjectId) => {
    navigate(`/community/${cid}`);
  };

  const isUserInCommunity = (title: string): boolean => {
    const community = communityList.find(c => c.title === title);
    return community
      ? community.members.includes(currentUser._id) ||
          community.admins.includes(currentUser._id) ||
          community.moderators.includes(currentUser._id)
      : false;
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

  /**
   * Updates the state value when the input field value changes.
   *
   * @param e - The input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
  };

  /**
   * Handles the 'Enter' key press event to perform a search action.
   * Constructs a search query and navigates to the search results page.
   *
   * @param e - The keyboard event object.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const newSearch = new URLSearchParams();
      const target = e.target as HTMLInputElement;
      newSearch.set('search', target.value);

      navigate(`/communities?${newSearch.toString()}`);
    }
  };

  const handleClickTag = async (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return {
    val,
    titleText,
    communityList,
    handleJoinCommunity,
    handleLeaveCommunity,
    handleViewCommunity,
    isUserInCommunity,
    toggleCommunityView,
    handleInputChange,
    handleKeyDown,
    communityTags,
    tagFilterList,
    handleClickTag,
    selectedTags,
  };
};

export default useCommunityPage;
