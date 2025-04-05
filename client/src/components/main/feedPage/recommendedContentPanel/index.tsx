import { FeedItem } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import RecommendedQuestionCard from '../recommendedQuestionCard';

const RecommendedContentPanel = ({
  feedItems,
  onNavToCommunity,
  onNavToQuestion,
}: {
  feedItems: Omit<FeedItem, '_id'>[];
  onNavToCommunity: (communityId: ObjectId) => void;
  onNavToQuestion: (questionId: ObjectId) => void;
}) => (
  <div>
    {feedItems.map(feedItem => (
      <RecommendedQuestionCard
        key={feedItem.question._id}
        item={feedItem}
        onNavToCommunity={onNavToCommunity}
        onNavToQuestion={onNavToQuestion}
      />
    ))}
  </div>
);

export default RecommendedContentPanel;
