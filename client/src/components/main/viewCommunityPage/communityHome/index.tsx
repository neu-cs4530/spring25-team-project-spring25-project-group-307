import { DatabaseCommunity } from '@fake-stack-overflow/shared';

interface CommunityHomeProps {
  community: DatabaseCommunity | null;
}

const CommunityHome = ({ community }: CommunityHomeProps) => (
  <div>
    <h1>{community?.title}</h1>
    <p>{community?.description}</p>
  </div>
);

export default CommunityHome;
