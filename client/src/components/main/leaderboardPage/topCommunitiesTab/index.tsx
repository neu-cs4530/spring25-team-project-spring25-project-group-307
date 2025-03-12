import TopCommunityCard from './topCommunityCard';
import { Community } from '../../../../types/community';

const TopCommunitiesTab = ({ communities }: { communities: Community[] }) => (
  <div>
    {communities.map(community => (
      <TopCommunityCard key={community.title} community={community} />
    ))}
  </div>
);

export default TopCommunitiesTab;
