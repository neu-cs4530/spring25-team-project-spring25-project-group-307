import { useState } from 'react';
import TopCommunityCard from './topCommunityCard';

const TopCommunitiesTab = () => {
  const [communities, setCommunities] = useState([
    {
      title: 'community1',
      description: 'A cool community',
      members: Array.from({ length: 100 }, () => undefined),
      questions: [],
    },
    {
      title: 'community2',
      description: 'Another cool community',
      members: Array.from({ length: 50 }, () => undefined),
      questions: [],
    },
    {
      title: 'community3',
      description: 'Also cool community',
      members: Array.from({ length: 10 }, () => undefined),
      questions: [],
    },
  ]);

  return (
    <div>
      {communities.map(community => (
        <TopCommunityCard key={community.title} community={community} />
      ))}
    </div>
  );
};

export default TopCommunitiesTab;
