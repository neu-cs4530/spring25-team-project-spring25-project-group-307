import { useState, useEffect } from 'react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Community } from '../types/community';

const useLeaderboardPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isCommunitiesLoading, setIsCommunitiesLoading] = useState(true);

  const [topUsers, setTopUsers] = useState<Omit<SafeDatabaseUser, '_id'>[]>([]);
  const [istopUsersLoading, setIsTopUsersLoading] = useState(true);

  useEffect(() => {
    // api call goes here
    setIsCommunitiesLoading(true);
    new Promise(resolve => {
      setTimeout(resolve, 1000);
    }).then(() => {
      setCommunities([
        {
          title: 'community1',
          description: 'A cool community',
          members: Array.from({ length: 100 }, () => ''),
        },
        {
          title: 'community2',
          description: 'Another cool community',
          members: Array.from({ length: 50 }, () => ''),
        },
        {
          title: 'community3',
          description: 'Also cool community',
          members: Array.from({ length: 10 }, () => ''),
        },
      ]);
      setIsCommunitiesLoading(false);
    });
  }, []);

  useEffect(() => {
    // api call goes here
    setIsTopUsersLoading(true);
    new Promise(resolve => {
      setTimeout(resolve, 1000);
    }).then(() => {
      setTopUsers([]);
      setIsTopUsersLoading(false);
    });
  }, []);
  return { communities, isCommunitiesLoading, topUsers, istopUsersLoading };
};

export default useLeaderboardPage;
