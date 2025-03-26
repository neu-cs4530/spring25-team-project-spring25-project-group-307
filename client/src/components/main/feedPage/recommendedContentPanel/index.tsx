import { FeedItem } from '@fake-stack-overflow/shared';
import RecommendedQuestionCard from '../recommendedQuestionCard';

const RecommendedContentPanel = ({ feedItems }: { feedItems: Omit<FeedItem, '_id'>[] }) => (
  <div>
    {feedItems.map(feedItem => (
      <RecommendedQuestionCard key={feedItem.question._id} item={feedItem} />
    ))}
  </div>
);

export default RecommendedContentPanel;
