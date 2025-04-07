import { useState, useEffect } from 'react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Community } from '../types/community';
import { getCommunities } from '../services/communityService';
import { getUsers } from '../services/userService'; // Assume you have this

const useLeaderboardPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isCommunitiesLoading, setIsCommunitiesLoading] = useState(true);

  const [topUsers, setTopUsers] = useState<Omit<SafeDatabaseUser, '_id'>[]>([]);
  const [istopUsersLoading, setIsTopUsersLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsCommunitiesLoading(true);
      try {
        const allCommunities = await getCommunities();
        const sorted = allCommunities
          .filter(c => c.members) // filter out any bad data
          .map(c => ({
            ...c,
            _id: c._id.toString(), // convert ObjectId to string
            members: c.members.map(member => member.toString()),
            admins: c.admins.map(admin => admin.toString()), // convert ObjectId[] to string[]
            moderators: c.moderators.map(moderator => moderator.toString()), // convert ObjectId[] to string[]
            tags: c.tags.map(tag => tag.toString()), // convert ObjectId[] to string[]
            questions: c.questions.map(question => question.toString()), // convert ObjectId[] to string[]
            pinnedQuestions: c.pinnedQuestions.map(pinnedQuestion => pinnedQuestion.toString()), // convert ObjectId[] to string[]
          }))

          .sort((a, b) => b.members.length - a.members.length);

        setCommunities(sorted);
      } catch (err) {
        // catch error
        setCommunities([]);
      } finally {
        setIsCommunitiesLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsTopUsersLoading(true);
      try {
        const allUsers: SafeDatabaseUser[] = await getUsers();
        const sorted = allUsers
          .filter((user: SafeDatabaseUser) => user.username && typeof user.score === 'number')
          .sort((a, b) => b.score - a.score);

        setTopUsers(sorted);
      } catch (err) {
        // catch error
        setTopUsers([]);
      } finally {
        setIsTopUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { communities, isCommunitiesLoading, topUsers, istopUsersLoading };
};

export default useLeaderboardPage;
